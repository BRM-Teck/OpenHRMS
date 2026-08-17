# -*- coding: utf-8 -*-
from odoo import models, fields


class HrReminder(models.Model):
    """HR reminder: notify users before a date field on an HR record expires."""
    _name = 'hr.reminder'
    _description = "HR Reminder"
    _order = 'name'

    name = fields.Char(string='Title', required=True,
                       help="Title of the reminder shown in the systray.")
    active = fields.Boolean(default=True, help="Uncheck to archive this reminder.")
    reminder_type = fields.Selection(
        [
            ('document', 'Document / expiry'),
            ('contract', 'Contract'),
            ('leave', 'Leave / absence'),
            ('other', 'Other'),
        ],
        string='Type',
        default='other',
        required=True,
        help="Used to group reminders in the list and the systray.",
    )
    description = fields.Text(
        string='Definition',
        help="Explain what this reminder is for (who should act, and why).",
    )
    notes = fields.Html(string='Notes', help="Internal notes for HR.")
    model_id = fields.Many2one('ir.model', help="Choose the model name",
                               string="Model", required=True,
                               ondelete='cascade',
                               domain="[('model', 'like','hr')]")
    field_id = fields.Many2one('ir.model.fields', string='Field',
                               help="Choose the date field that triggers the reminder.",
                               domain="[('model_id', '=',model_id),"
                                      "('ttype', 'in', ['datetime','date'])]"
                               , required=True, ondelete='cascade')
    search_by = fields.Selection([('today', 'Today'),
                                  ('set_period', 'Set Period'),
                                  ('set_date', 'Set Date'), ],
                                 required=True, string="Search By",
                                 help="Search by the given field")
    days_before = fields.Integer(string='Reminder before',
                                 help="Number of days before the reminder "
                                      "should show")
    date_set = fields.Date(string='Select Date',
                           help="Select the reminder set date")
    date_from = fields.Date(string="Start Date",
                            help="Start date to show the reminder")
    date_to = fields.Date(string="End Date",
                          help="End date to not show the reminder")
    expiry_date = fields.Date(string="Reminder Expiry Date",
                              help="Expiry date to expires out the reminder")
    company_id = fields.Many2one('res.company', string='Company',
                                 required=True,
                                 help="The company to which this reminder belongs.",
                                 default=lambda self: self.env.company)
