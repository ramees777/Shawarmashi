# -*- coding: utf-8 -*-
{
    'name': "POS Discount Limit",

    'summary': """
        pos dicsount limit on pos product categories""",

    'author': "",

    'category': 'Uncategorized',
    'version': '14.0.0.1',

    # any module necessary for this one to work correctly
    'depends': ['base', 'point_of_sale'],

    # always loaded
    'data': [
        'security/ir.model.access.csv',
        'views/discount_categories_views.xml',
        'views/discount_limit_views.xml',
        'views/pos_discount_limit_template.xml',

    ],

}
