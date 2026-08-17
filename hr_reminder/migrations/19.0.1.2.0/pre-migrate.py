# -*- coding: utf-8 -*-
def migrate(cr, version):
    cr.execute("""
        DELETE FROM ir_ui_view WHERE id IN (
            SELECT res_id FROM ir_model_data
            WHERE module = 'hr_reminder'
              AND name = 'hr_reminder_definition_view_form'
              AND model = 'ir.ui.view'
        );
        DELETE FROM ir_act_server WHERE id IN (
            SELECT res_id FROM ir_model_data
            WHERE module = 'hr_reminder'
              AND name = 'hr_reminder_definition_action'
        );
        UPDATE ir_ui_menu SET active = false, action = NULL WHERE id IN (
            SELECT res_id FROM ir_model_data
            WHERE module = 'hr_reminder'
              AND name IN ('hr_reminder_menu_definition', 'hr_reminder_menu_list')
        );
        DELETE FROM ir_model_access WHERE id IN (
            SELECT res_id FROM ir_model_data
            WHERE module = 'hr_reminder'
              AND name = 'access_hr_reminder_definition_user'
        );
        DELETE FROM ir_model_data
        WHERE module = 'hr_reminder'
          AND name IN (
            'hr_reminder_definition_view_form',
            'hr_reminder_definition_action',
            'model_hr_reminder_definition',
            'access_hr_reminder_definition_user'
          );
        DELETE FROM ir_model WHERE model = 'hr.reminder.definition';
    """)
