package services

import (
	"bytes"
	"context"
	"crypto/tls"
	"fmt"
	"net/smtp"
	"strings"
	"text/template"

	"gigaboo.io/lem/internal/config"
	"gigaboo.io/lem/internal/ent"
	"gigaboo.io/lem/internal/ent/app"
	"gigaboo.io/lem/internal/ent/emailtemplate"
)

// EmailService handles email operations.
type EmailService struct {
	cfg    *config.Config
	client *ent.Client
}

// NewEmailService creates a new email service.
func NewEmailService(cfg *config.Config, client *ent.Client) *EmailService {
	return &EmailService{
		cfg:    cfg,
		client: client,
	}
}

// SendEmailInput represents send email request.
type SendEmailInput struct {
	To        string            `json:"to" binding:"required,email"`
	Subject   string            `json:"subject"`
	Body      string            `json:"body"`
	Template  string            `json:"template"`
	Variables map[string]string `json:"variables"`
}

// SendEmail sends an email.
func (s *EmailService) SendEmail(ctx context.Context, appID int, input SendEmailInput) error {
	var subject, body string

	if input.Template != "" {
		// Load template from database
		tmpl, err := s.client.EmailTemplate.Query().
			Where(emailtemplate.Name(input.Template)).
			First(ctx)
		if err != nil {
			return fmt.Errorf("template not found: %s", input.Template)
		}

		// Apply variables to template
		subject, err = s.applyTemplate(tmpl.Subject, input.Variables)
		if err != nil {
			return err
		}

		bodyTemplate := tmpl.BodyHTML
		if bodyTemplate == "" {
			bodyTemplate = tmpl.BodyText
		}
		body, err = s.applyTemplate(bodyTemplate, input.Variables)
		if err != nil {
			return err
		}
	} else {
		subject = input.Subject
		body = input.Body
	}

	return s.send(input.To, subject, body)
}

// SendPasswordReset sends a password reset email.
func (s *EmailService) SendPasswordReset(ctx context.Context, appID int, email, resetLink string) error {
	return s.SendEmail(ctx, appID, SendEmailInput{
		To:       email,
		Template: "password_reset",
		Variables: map[string]string{
			"email": email,
			"link":  resetLink,
		},
	})
}

// SendWelcome sends a welcome email.
func (s *EmailService) SendWelcome(ctx context.Context, appID int, email, name string) error {
	return s.SendEmail(ctx, appID, SendEmailInput{
		To:       email,
		Template: "welcome",
		Variables: map[string]string{
			"name":  name,
			"email": email,
		},
	})
}

// SendInvitation sends an organization invitation email.
func (s *EmailService) SendInvitation(ctx context.Context, appID int, email, orgName, inviteLink string) error {
	return s.SendEmail(ctx, appID, SendEmailInput{
		To:       email,
		Template: "invitation",
		Variables: map[string]string{
			"email":    email,
			"org_name": orgName,
			"link":     inviteLink,
		},
	})
}

func (s *EmailService) applyTemplate(tmpl string, vars map[string]string) (string, error) {
	t, err := template.New("email").Parse(tmpl)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, vars); err != nil {
		return "", err
	}

	return buf.String(), nil
}

func (s *EmailService) send(to, subject, body string) error {
	if s.cfg.SMTPUser == "" || s.cfg.SMTPPassword == "" {
		return fmt.Errorf("SMTP not configured")
	}

	from := s.cfg.SMTPFromEmail
	fromName := s.cfg.SMTPFromName

	// Build email message
	msg := strings.Builder{}
	msg.WriteString(fmt.Sprintf("From: %s <%s>\r\n", fromName, from))
	msg.WriteString(fmt.Sprintf("To: %s\r\n", to))
	msg.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	msg.WriteString("MIME-Version: 1.0\r\n")
	msg.WriteString("Content-Type: text/html; charset=UTF-8\r\n")
	msg.WriteString("\r\n")
	msg.WriteString(body)

	// Connect to SMTP server
	addr := fmt.Sprintf("%s:%d", s.cfg.SMTPHost, s.cfg.SMTPPort)

	auth := smtp.PlainAuth("", s.cfg.SMTPUser, s.cfg.SMTPPassword, s.cfg.SMTPHost)

	// Use TLS
	tlsConfig := &tls.Config{
		ServerName: s.cfg.SMTPHost,
	}

	conn, err := tls.Dial("tcp", addr, tlsConfig)
	if err != nil {
		// Try without TLS
		return smtp.SendMail(addr, auth, from, []string{to}, []byte(msg.String()))
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, s.cfg.SMTPHost)
	if err != nil {
		return err
	}
	defer client.Close()

	if err := client.Auth(auth); err != nil {
		return err
	}

	if err := client.Mail(from); err != nil {
		return err
	}

	if err := client.Rcpt(to); err != nil {
		return err
	}

	writer, err := client.Data()
	if err != nil {
		return err
	}

	_, err = writer.Write([]byte(msg.String()))
	if err != nil {
		return err
	}

	return writer.Close()
}

// ListTemplates returns all email templates for an app.
func (s *EmailService) ListTemplates(ctx context.Context, appID int) ([]*ent.EmailTemplate, error) {
	return s.client.EmailTemplate.Query().
		Where(emailtemplate.HasAppWith(app.ID(appID))).
		All(ctx)
}

// GetTemplate returns a single template by name.
func (s *EmailService) GetTemplate(ctx context.Context, appID int, name string) (*ent.EmailTemplate, error) {
	return s.client.EmailTemplate.Query().
		Where(
			emailtemplate.Name(name),
			emailtemplate.HasAppWith(app.ID(appID)),
		).
		First(ctx)
}

// SendTemplateEmail sends email using a template.
func (s *EmailService) SendTemplateEmail(ctx context.Context, appID int, to, templateName string, variables map[string]string) error {
	return s.SendEmail(ctx, appID, SendEmailInput{
		To:        to,
		Template:  templateName,
		Variables: variables,
	})
}

// SendRawEmail sends a raw email without template.
func (s *EmailService) SendRawEmail(ctx context.Context, to, subject, bodyHTML, bodyText string) error {
	body := bodyHTML
	if body == "" {
		body = bodyText
	}
	return s.send(to, subject, body)
}

// CreateTemplateInput for creating templates.
type CreateTemplateInput struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Subject     string   `json:"subject"`
	BodyHTML    string   `json:"body_html"`
	BodyText    string   `json:"body_text"`
	Variables   []string `json:"variables"`
}

// UpdateTemplateInput for updating templates.
type UpdateTemplateInput struct {
	Description *string  `json:"description"`
	Subject     *string  `json:"subject"`
	BodyHTML    *string  `json:"body_html"`
	BodyText    *string  `json:"body_text"`
	Variables   []string `json:"variables"`
}

// CreateTemplate creates a new email template.
func (s *EmailService) CreateTemplate(ctx context.Context, appID int, input CreateTemplateInput) (*ent.EmailTemplate, error) {
	return s.client.EmailTemplate.Create().
		SetAppID(appID).
		SetName(input.Name).
		SetDescription(input.Description).
		SetSubject(input.Subject).
		SetBodyHTML(input.BodyHTML).
		SetBodyText(input.BodyText).
		SetVariables(input.Variables).
		Save(ctx)
}

// UpdateTemplate updates an email template.
func (s *EmailService) UpdateTemplate(ctx context.Context, appID int, name string, input UpdateTemplateInput) (*ent.EmailTemplate, error) {
	tmpl, err := s.GetTemplate(ctx, appID, name)
	if err != nil {
		return nil, err
	}

	update := s.client.EmailTemplate.UpdateOne(tmpl)
	if input.Description != nil {
		update.SetDescription(*input.Description)
	}
	if input.Subject != nil {
		update.SetSubject(*input.Subject)
	}
	if input.BodyHTML != nil {
		update.SetBodyHTML(*input.BodyHTML)
	}
	if input.BodyText != nil {
		update.SetBodyText(*input.BodyText)
	}
	if input.Variables != nil {
		update.SetVariables(input.Variables)
	}
	return update.Save(ctx)
}

// DeleteTemplate deletes an email template.
func (s *EmailService) DeleteTemplate(ctx context.Context, appID int, name string) error {
	_, err := s.client.EmailTemplate.Delete().
		Where(emailtemplate.Name(name)).
		Exec(ctx)
	return err
}
