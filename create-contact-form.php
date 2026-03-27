<?php
/**
 * Script pour créer un formulaire de contact Gravity Forms
 *
 * INSTRUCTIONS:
 * 1. Ouvrir ce fichier dans votre navigateur: http://climate-contribution-framework.local/create-contact-form.php
 * 2. Le formulaire sera créé automatiquement
 * 3. Supprimer ce fichier après utilisation pour des raisons de sécurité
 */

// Charger WordPress
require_once(__DIR__ . '/wp-load.php');

// Vérifier que Gravity Forms est installé
if (!class_exists('GFAPI')) {
    die("<h1>❌ Error</h1><p>Gravity Forms is not installed or activated. Please install and activate Gravity Forms first.</p>");
}

// Vérifier si le formulaire existe déjà
$existing_forms = GFAPI::get_forms();
$form_exists = false;
$existing_form_id = null;

foreach ($existing_forms as $existing_form) {
    if ($existing_form['title'] === 'Contact Form') {
        $form_exists = true;
        $existing_form_id = $existing_form['id'];
        break;
    }
}

if ($form_exists) {
    echo "<h1>⚠️ Form Already Exists</h1>";
    echo "<p>A form with the title 'Contact Form' already exists (ID: $existing_form_id)</p>";
    echo "<p><a href='" . admin_url("admin.php?page=gf_edit_forms&id=$existing_form_id") . "'>Edit this form</a></p>";
    echo "<p><strong>Use formId={$existing_form_id} in your Next.js app</strong></p>";
    exit;
}

// Définir le formulaire
$form = array(
    'title' => 'Contact Form',
    'description' => 'Get in touch with us',
    'labelPlacement' => 'top_label',
    'descriptionPlacement' => 'below',
    'button' => array(
        'type' => 'text',
        'text' => 'Send Message'
    ),
    'fields' => array(
        // Field 1: Full Name
        array(
            'type' => 'text',
            'label' => 'Full Name',
            'isRequired' => true,
            'placeholder' => 'John Doe',
            'cssClass' => 'gfield-fullname'
        ),

        // Field 2: Email Address
        array(
            'type' => 'email',
            'label' => 'Email Address',
            'isRequired' => true,
            'placeholder' => 'john.doe@example.com',
            'description' => 'We\'ll never share your email with anyone else',
            'descriptionPlacement' => 'below',
            'cssClass' => 'gfield-email'
        ),

        // Field 3: Phone Number
        array(
            'type' => 'phone',
            'label' => 'Phone Number',
            'isRequired' => false,
            'placeholder' => '+1 (555) 123-4567',
            'cssClass' => 'gfield-phone',
            'phoneFormat' => 'international'
        ),

        // Field 4: Subject
        array(
            'type' => 'select',
            'label' => 'Subject',
            'isRequired' => true,
            'placeholder' => 'Select a subject',
            'cssClass' => 'gfield-subject',
            'choices' => array(
                array('text' => 'General Inquiry', 'value' => 'general'),
                array('text' => 'Technical Support', 'value' => 'support'),
                array('text' => 'Sales Question', 'value' => 'sales'),
                array('text' => 'Partnership Opportunity', 'value' => 'partnership'),
                array('text' => 'Other', 'value' => 'other')
            )
        ),

        // Field 5: Message
        array(
            'type' => 'textarea',
            'label' => 'Message',
            'isRequired' => true,
            'placeholder' => 'Tell us more about your inquiry...',
            'description' => 'Please provide as much detail as possible',
            'descriptionPlacement' => 'below',
            'cssClass' => 'gfield-message'
        ),

        // Field 6: Preferences (Checkbox)
        array(
            'type' => 'checkbox',
            'label' => 'Preferences',
            'isRequired' => false,
            'cssClass' => 'gfield-preferences',
            'choices' => array(
                array('text' => 'Subscribe to newsletter', 'value' => 'newsletter'),
                array('text' => 'I agree to the privacy policy', 'value' => 'privacy')
            )
        )
    ),
    'confirmations' => array(
        array(
            'id' => '1',
            'name' => 'Default Confirmation',
            'isDefault' => true,
            'type' => 'message',
            'message' => 'Thank you! Your message has been sent successfully.',
            'url' => '',
            'pageId' => '',
            'queryString' => ''
        )
    ),
    'notifications' => array(
        array(
            'id' => '1',
            'name' => 'Admin Notification',
            'isActive' => true,
            'to' => '{admin_email}',
            'subject' => 'New Contact Form Submission',
            'message' => '{all_fields}'
        )
    )
);

// Créer le formulaire
$form_id = GFAPI::add_form($form);

if (is_wp_error($form_id)) {
    echo "<h1>❌ Error</h1>";
    echo "<p>Error creating form: " . $form_id->get_error_message() . "</p>";
    exit;
}

// Succès !
?>
<!DOCTYPE html>
<html>
<head>
    <title>Contact Form Created</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .success-box {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #46b450;
            margin-top: 0;
        }
        .form-id {
            font-size: 24px;
            font-weight: bold;
            color: #0073aa;
            background: #f0f6fc;
            padding: 10px 20px;
            border-radius: 4px;
            display: inline-block;
            margin: 10px 0;
        }
        .info {
            background: #f0f6fc;
            padding: 15px;
            border-left: 4px solid #0073aa;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: #0073aa;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 10px 10px 10px 0;
        }
        .button:hover {
            background: #005a87;
        }
        .warning {
            background: #fff3cd;
            padding: 15px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
            color: #856404;
        }
        code {
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="success-box">
        <h1>✅ Contact Form Created Successfully!</h1>

        <div class="info">
            <p><strong>Form ID:</strong></p>
            <div class="form-id"><?php echo $form_id; ?></div>
        </div>

        <h2>📋 Form Details</h2>
        <ul>
            <li><strong>Title:</strong> Contact Form</li>
            <li><strong>Fields:</strong> 6 fields (Name, Email, Phone, Subject, Message, Preferences)</li>
            <li><strong>Submit Button:</strong> Send Message</li>
            <li><strong>Confirmation Message:</strong> "Thank you! Your message has been sent successfully."</li>
        </ul>

        <h2>🚀 Next Steps</h2>

        <h3>1. View/Edit the Form in WordPress</h3>
        <a href="<?php echo admin_url("admin.php?page=gf_edit_forms&id=$form_id"); ?>" class="button">
            Edit Form in WordPress
        </a>

        <h3>2. Use in Your Next.js App</h3>
        <div class="info">
            <p>Add the form block in your editor with this configuration:</p>
            <code>formId: <?php echo $form_id; ?></code>
        </div>

        <h3>3. Test the Form</h3>
        <a href="<?php echo admin_url("admin.php?page=gf_entries&id=$form_id"); ?>" class="button">
            View Entries
        </a>

        <div class="warning">
            <strong>⚠️ Security Warning:</strong> Please delete this file (<code>create-contact-form.php</code>) from your WordPress root directory after use.
        </div>

        <h2>💻 Component Usage Example</h2>
        <pre><code>&lt;BlockForm formId={<?php echo $form_id; ?>} /&gt;</code></pre>
    </div>
</body>
</html>
<?php
