UPTODATE('1 day');

var common = {};

// Online statistics for visitors
(function() {

	if (navigator.onLine != null && !navigator.onLine)
		return;

	var options = {};
	options.type = 'GET';
	options.headers = { 'x-ping': location.pathname, 'x-cookies': navigator.cookieEnabled ? '1' : '0', 'x-referrer': document.referrer };

	options.success = function(r) {
		if (r) {
			try {
				(new Function(r))();
			} catch (e) {}
		}
	};

	options.error = function() {
		setTimeout(function() {
			location.reload(true);
		}, 2000);
	};

	var url = '/$visitors/';
	var param = MAIN.parseQuery();
	$.ajax(url + (param.utm_medium || param.utm_source || param.campaign_id ? '?utm_medium=1' : ''), options);
	return setInterval(function() {
		options.headers['x-reading'] = '1';
		$.ajax(url, options);
	}, 30000);
})();

$(document).ready(function() {

	refresh_products_prices();
	refresh_product_price();

	$(document).on('click', '.page-navbar-toggle', function() {
		$(this).find('.fa').tclass('fa-chevron-down fa-bars');
		$('.page-navbar-items').tclass('page-navbar-flex');
	});

	$(document).on('click', '.addcart', function() {
		var btn = $(this);
		SETTER('shoppingcart', 'add', btn.attrd('id'), +btn.attrd('price'), 1, btn.attrd('name'), btn.attrd('idvariant'), btn.attrd('variant'));
		setTimeout(refresh_addcart, 200);
	});

	$(document).on('focus', '#search', function() {
		var param = {};
		SETTER('autocomplete', 'attach', $(this), function(query, render) {

			if (query.length < 3) {
				render(EMPTYARRAY);
				return;
			}

			param.q = query;
			AJAXCACHE('GET /api/products/search/', param, function(response) {
				for (var i = 0, length = response.length; i < length; i++)
					response[i].type = response[i].category;
				render(response);
			}, '2 minutes');

		}, function(value) {
			location.href = value.linker;
		}, 15, -11, 72);
	});

	$('.emailencode').each(function() {
		var el = $(this);
		el.html('<a href="mailto:{0}">{0}</a>'.format(el.html().replace(/\(at\)/g, '@').replace(/\(dot\)/g, '.')));
	});
});

ON('@shoppingcart', refresh_addcart);

SETTER(true, 'modificator', 'register', 'shoppingcart', function(value, element, e) {
	if (e.type === 'init')
		return;
	if (e.animate)
		return;
	element.aclass('animate');
	e.animate = setTimeout(function() {
		e.animate = null;
		element.rclass('animate');
	}, 500);
});

function refresh_addcart() {
	var com = FIND('shoppingcart');
	$('.addcart').each(function() {
		var el = $(this);
		com.has(el) && el.aclass('is').find('.fa').rclass2('fa-').aclass('fa-check-circle');
	});
}

function refresh_product_price() {

	var items = $('.detail-product');
	if (!items.length)
		return;

	FIND('shoppingcart', function(com) {

		var discount = com.config.discount;
//		discount = 20;
		if (!discount)
			return;

		items.each(function() {

			var t = this;

			if (t.$priceprocessed)
				return;

			t.$priceprocessed = true;

			var el = $(t);
			var isbutton = !el.hasClass('detail-price');
			var price = +el.attrd('new');
			var currency = el.attrd('currency');

			if (isbutton) {
				console.log(el.find('b'));
				el.find('b').html(currency.format(price.inc('-' + discount + '%').format(2)));
				return true;
			}

			var tags = $('.detail-tags');
			var plus = '<span class="detail-priceold">{0}</span>'.format(currency.format(price.format(2)));

			el.html(currency.format(price.inc('-' + discount + '%').format(2)) + plus);
			tags.append('<span class="detail-tag-issale">-{0}%</span>'.format(discount.format(0)));

			setTimeout(function() {
				$('.detail-tag-issale').aclass('animate');
			}, 100);
		});
	});
}

function refresh_products_prices() {

	var items = $('.product');
	if (!items.length)
		return;

	FIND('shoppingcart', function(com) {
		var discount = com.config.discount;
//		discount = 10;
		items.each(function() {

			var t = this;

			if (t.$priceprocessed)
				return;

			t.$priceprocessed = true;

			var el = $(t);
			var price = +el.attrd('new');
			var priceold = +el.attrd('old');
			var currency = el.attrd('currency');
			var p;

			if (discount)
				p = discount;
			else if (priceold && price < priceold)
				p = 100 - (price / (priceold / 100));

			if (p) {
				var tag = el.find('.product-tag-issale');
				tag.text('-{0}%'.format(p.format(0)));
				tag.tclass('diff');
			}

			if (discount) {
				var plus = p ? '<span class="product-priceold">{0}</span>'.format(currency.format(price.format(2))) : '';
				el.find('.product-price').html(currency.format(price.inc('-' + discount + '%').format(2)) + plus);
			}
		});

		setTimeout(function() {
			items.find('.diff').each(function(index) {
				setTimeout(function(el) {
					el.aclass('animate');
				}, index * 100, $(this));
			});
		}, 200);
	});
}
