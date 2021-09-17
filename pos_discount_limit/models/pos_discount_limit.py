# -*- coding: utf-8 -*-

from odoo import models, fields, api


class DiscountLimit(models.Model):
    _inherit = 'pos.config'
    _description = 'discount limit'

    available_categ_ids = fields.Many2many('discount.categories')
    excluded_categ_id = fields.Many2many('pos.category','iface_available_categ_ids',
                    string='Available PoS Product Categories')
