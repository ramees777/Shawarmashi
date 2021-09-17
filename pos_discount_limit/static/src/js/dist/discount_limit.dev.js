"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

odoo.define('pos_discount_limit.discount_limit', function (require) {
  'use strict';

  var field_utils = require('web.field_utils');

  var PosComponent = require('point_of_sale.PosComponent');

  var models = require('point_of_sale.models');

  var Registries = require('point_of_sale.Registries');

  var NumberBuffer = require('point_of_sale.NumberBuffer');

  var ProductScreen = require('point_of_sale.ProductScreen');

  var _require = require('point_of_sale.Gui'),
      Gui = _require.Gui;

  var _require2 = require('web.core'),
      _t = _require2._t;

  models.load_fields("product.product", ["qty_available", "type", "stock_quant_ids"]);
  models.load_models({
    model: 'discount.categories',
    fields: ['discount_limit', 'category_id'],
    domain: function domain(self) {
      return [['id', '=', self.config.available_categ_ids]];
    },
    loaded: function loaded(self, limits) {
      self.limits = limits;
      var limit = self.limits;
      console.log("retrieval sucess", limit);
    }
  });
  models.load_models({
    model: 'pos.category',
    fields: ['id', 'name', 'parent_id', 'child_id', 'write_date'],
    domain: function domain(self) {
      return [['id', '=', self.config.excluded_categ_id]];
    },
    loaded: function loaded(self, categories) {
      self.categories = categories;
      console.log("retrieval sucess product category", categories);
    }
  });

  var ProductDiscount = function ProductDiscount(ProductScreen) {
    return (
      /*#__PURE__*/
      function (_ProductScreen) {
        _inherits(_class, _ProductScreen);

        function _class() {
          _classCallCheck(this, _class);

          return _possibleConstructorReturn(this, _getPrototypeOf(_class).apply(this, arguments));
        }

        _createClass(_class, [{
          key: "_setValue",
          value: function _setValue(val) {
            console.log("pos SCreen function worked");
            var parsed_discount = isNaN(parseFloat(val)) ? 0 : field_utils.parse["float"]('' + val);
            var disc = Math.min(Math.max(parsed_discount || 0, 0), 100);
            var available_categories = this.currentOrder.get_selected_orderline().product.pos_categ_id[0];
            var disc_available_categories = this.env.pos.limits;
            var restricted_categories = this.env.pos.config.excluded_categ_id;
            var restricte_cat_load = this.env.pos.categories;
            console.log("discount restricted categories test", restricted_categories);
            console.log("discount entered", disc);
            console.log("Current Order", available_categories);
            console.log("discount categories", disc_available_categories);

            if (this.currentOrder.get_selected_orderline()) {
              if (this.state.numpadMode === 'quantity') {
                this.currentOrder.get_selected_orderline().set_quantity(val);
              } else if (this.state.numpadMode === 'discount') {
                for (var i = 0; i < restricte_cat_load.length; i++) {
                  console.log("discount restricted categories loop", restricte_cat_load[i].id);

                  if (restricte_cat_load[i].id == available_categories) {
                    console.log("discount restricted category matched");
                    Gui.showPopup('ErrorPopup', {
                      title: _t("Discount Not Allowed"),
                      body: _t("Discount not allowed for this category")
                    });
                    return;
                  }
                }

                for (var i = 0; i < disc_available_categories.length; i++) {
                  console.log("loop elements", disc_available_categories[i].category_id[0]);

                  if (disc_available_categories[i].category_id[0] == available_categories) {
                    console.log("catgories matched");
                    var disc_limit = disc_available_categories[i].discount_limit;
                    console.log("dicount limit of category", disc_limit);

                    if (disc_limit) {
                      if (disc > disc_limit) {
                        Gui.showPopup('ErrorPopup', {
                          title: _t("Discount limit exceeded"),
                          body: _t("The maximum discount is " + disc_limit)
                        });
                        this.currentOrder.get_selected_orderline().set_discount(0);
                        return;
                      }
                    }
                  } else {
                    this.currentOrder.get_selected_orderline().set_discount(val);
                  }
                }

                this.currentOrder.get_selected_orderline().set_discount(val);
              } else if (this.state.numpadMode === 'price') {
                var selected_orderline = this.currentOrder.get_selected_orderline();
                selected_orderline.price_manually_set = true;
                selected_orderline.set_unit_price(val);
              }

              if (this.env.pos.config.iface_customer_facing_display) {
                this.env.pos.send_current_order_to_customer_facing_display();
              }
            }
          }
        }]);

        return _class;
      }(ProductScreen)
    );
  };

  Registries.Component.extend(ProductScreen, ProductDiscount);
  return ProductScreen;
});