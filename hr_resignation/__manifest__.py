# -*- coding: utf-8 -*-
#############################################################################
#    A part of Open HRMS Project <https://www.openhrms.com>
#
#    Cybrosys Technologies Pvt. Ltd.
#
#    Copyright (C) 2025-TODAY Cybrosys Technologies(<https://www.cybrosys.com>)
#    Author: Cybrosys Techno Solutions(<https://www.cybrosys.com>)
#
#    You can modify it under the terms of the GNU LESSER
#    GENERAL PUBLIC LICENSE (LGPL v3), Version 3.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU LESSER GENERAL PUBLIC LICENSE (LGPL v3) for more details.
#
#    You should have received a copy of the GNU LESSER GENERAL PUBLIC LICENSE
#    (LGPL v3) along with this program.
#    If not, see <http://www.gnu.org/licenses/>.
#
#############################################################################
{
    'name': 'Open HRMS Resignation',
    'version': '19.0.1.3.0',
    'category': 'Human Resources',
    'summary': 'Employee resignation workflow: request, approve, reject, last day',
    'description': """
Démissions
==========

**Définition.** Le module Resignation gère le départ d'un employé :
demande, confirmation, approbation ou rejet par les RH, puis
désactivation du salarié et de son utilisateur le jour de sortie.

**États**

* Brouillon — la demande est créée.
* Confirmé — l'employé a confirmé son départ.
* Approuvé — les RH ont validé ; le contrat et l'accès sont traités
  à la date de sortie.
* Rejeté — la demande est refusée.

**Types**

* Démission normale
* Licenciement (fired by the company)

Les fiches employés restent dans l'application Employés. Ce module
n'est pas un second annuaire du personnel.
""",
    'author': 'Cybrosys Techno solutions,Open HRMS',
    'company': 'Cybrosys Techno Solutions',
    'maintainer': 'Cybrosys Techno Solutions',
    'website': 'https://www.openhrms.com',
    'depends': ['hr_employee_updation'],
    'data': [
        'security/hr_resignation_security.xml',
        'security/ir.model.access.csv',
        'data/ir_sequence_data.xml',
        'data/ir_cron_data.xml',
        'views/hr_employee_views.xml',
        'views/hr_resignation_views.xml',
    ],
    'live_test_url': 'https://youtu.be/BorJthxY_VI',
    'images': ['static/description/banner.jpg'],
    'license': 'LGPL-3',
    'installable': True,
    'auto_install': False,
    'application': True,
}
