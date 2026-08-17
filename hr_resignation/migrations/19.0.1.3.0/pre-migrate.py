# -*- coding: utf-8 -*-
def migrate(cr, version):
    cr.execute("""
        DELETE FROM ir_ui_view WHERE id IN (
            SELECT res_id FROM ir_model_data
            WHERE module = 'hr_resignation'
              AND name = 'hr_resignation_definition_view_form'
              AND model = 'ir.ui.view'
        );
        DELETE FROM ir_act_server WHERE id IN (
            SELECT res_id FROM ir_model_data
            WHERE module = 'hr_resignation'
              AND name = 'hr_resignation_definition_action'
        );
        UPDATE ir_ui_menu SET active = false, action = NULL WHERE id IN (
            SELECT res_id FROM ir_model_data
            WHERE module = 'hr_resignation'
              AND name = 'hr_resignation_menu_definition'
        );
        DELETE FROM ir_model_access WHERE id IN (
            SELECT res_id FROM ir_model_data
            WHERE module = 'hr_resignation'
              AND name = 'access_hr_resignation_definition_user'
        );
        DELETE FROM ir_model_data
        WHERE module = 'hr_resignation'
          AND name IN (
            'hr_resignation_definition_view_form',
            'hr_resignation_definition_action',
            'model_hr_resignation_definition',
            'access_hr_resignation_definition_user'
          );
        DELETE FROM ir_model WHERE model = 'hr.resignation.definition';
    """)
