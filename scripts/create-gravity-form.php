<?php
/**
 * Script pour créer un formulaire Gravity Forms
 *
 * Usage: Copier ce fichier dans le dossier racine WordPress et l'exécuter via le navigateur
 * OU l'exécuter via: php -f create-gravity-form.php
 *
 * IMPORTANT: Ce script nécessite que WordPress et Gravity Forms soient installés
 */

// Charger WordPress
$wp_load_path = '/Users/raphaeldelaroche/Local Sites/climate-contribution-framework/app/public/wp-load.php';

if (!file_exists($wp_load_path)) {
    die("❌ WordPress not found at: $wp_load_path\n");
}

require_once($wp_load_path);

// Vérifier que Gravity Forms est installé
if (!class_exists('GFAPI')) {
    die("❌ Gravity Forms is not installed or activated\n");
}

echo "✅ WordPress loaded\n";
echo "✅ Gravity Forms detected\n\n";

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
            'id' => 1,
            'type' => 'text',
            'label' => 'Full Name',
            'isRequired' => true,
            'placeholder' => 'John Doe',
            'cssClass' => 'gfield-fullname'
        ),

        // Field 2: Email Address
        array(
            'id' => 2,
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
            'id' => 3,
            'type' => 'phone',
            'label' => 'Phone Number',
            'isRequired' => false,
            'placeholder' => '+1 (555) 123-4567',
            'cssClass' => 'gfield-phone'
        ),

        // Field 4: Subject
        array(
            'id' => 4,
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
            'id' => 5,
            'type' => 'textarea',
            'label' => 'Message',
            'isRequired' => true,
            'placeholder' => 'Tell us more about your inquiry...',
            'description' => 'Please provide as much detail as possible',
            'descriptionPlacement' => 'below',
            'cssClass' => 'gfield-message',
            'rows' => 6
        ),

        // Field 6: Preferences (Checkbox)
        array(
            'id' => 6,
            'type' => 'checkbox',
            'label' => 'Preferences',
            'isRequired' => false,
            'cssClass' => 'gfield-preferences',
            'choices' => array(
                array('text' => 'Subscribe to newsletter', 'value' => 'newsletter'),
                array('text' => 'I agree to the privacy policy', 'value' => 'privacy')
            )
        )
    )
);

// Créer le formulaire
$form_id = GFAPI::add_form($form);

if (is_wp_error($form_id)) {
    echo "❌ Error creating form: " . $form_id->get_error_message() . "\n";
    exit(1);
}

echo "✅ Contact form created successfully!\n";
echo "📋 Form ID: $form_id\n";
echo "🔗 Edit form: " . admin_url("admin.php?page=gf_edit_forms&id=$form_id") . "\n\n";

// Afficher les informations du formulaire créé
echo "📝 Form details:\n";
echo "   - Title: Contact Form\n";
echo "   - Fields: 6 (Name, Email, Phone, Subject, Message, Preferences)\n";
echo "   - Submit button: Send Message\n\n";

echo "🎉 Done! You can now use this form in your Next.js app with formId={$form_id}\n";
