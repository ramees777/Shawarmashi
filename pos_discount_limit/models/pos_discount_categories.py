# -*- coding: utf-8 -*-

from odoo import models, fields, api


class DiscountCategories(models.Model):
    _name = 'discount.categories'
    _description = 'to set discount limit for each categories'
    _rec_name = 'category_id'

    category_id = fields.Many2one('pos.category', index=True)
    discount_limit = fields.Float(string='Discount Limit', default=0.00,
                                  index=True)
