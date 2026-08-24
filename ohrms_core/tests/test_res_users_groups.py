# -*- coding: utf-8 -*-
from odoo.tests.common import TransactionCase


class TestResUsersGroups(TransactionCase):

    def test_res_users_has_group_ids_field(self):
        """Verify res.users has group_ids field and reading it succeeds."""
        user = self.env.user
        records = user.read(["group_ids"])
        self.assertTrue(records)
        self.assertIn("group_ids", records[0])

    def test_res_users_groups_id_invalid_field(self):
        """Verify reading obsolete groups_id on res.users raises ValueError."""
        user = self.env.user
        with self.assertRaises(ValueError):
            user.read(["groups_id"])
