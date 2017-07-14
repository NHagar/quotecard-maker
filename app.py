#!/usr/bin/env python
"""
Example application views.

Note that `render_template` is wrapped with `make_response` in all application
routes. While not necessary for most Flask apps, it is required in the
App Template for static publishing.
"""

from datetime import datetime

import requests
import app_config
import static

from lxml import html
from flask import Flask, make_response, render_template
from render_utils import make_context, smarty_filter, urlencode_filter
from werkzeug.debug import DebuggedApplication

app = Flask(__name__)
app.debug = app_config.DEBUG

app.add_template_filter(smarty_filter, name='smarty')
app.add_template_filter(urlencode_filter, name='urlencode')

@app.route('/')
@app.route('/index.html')
def index():
    """
    Example view demonstrating rendering a simple HTML page.
    """
    context = make_context()
    context['name'] = 'Lunchbox'
    context['id'] = 'home'
    context['now'] = datetime.now().strftime('%B %-d, %Y')
    return make_response(render_template('waterbug.html', **context))

@app.route('/stories', methods=['GET'])
def stories():
    """API endpoint for getting story image URLs"""
    context = make_context()
    context['name'] = 'Stories'
    context['id'] = 'stories'
    context['now'] = datetime.now().strftime('%B %-d, %Y')
    from flask import request
    story = str(request.args.get('url'))
    page = requests.get(story)
    tree = html.fromstring(page.content)
    if 'sportsday' in story:
        img = img=tree.xpath('//img[@class="article-content__figure__img gl-full gm-full gs-full  new-line lazyload"]/@data-srcset')[0].split('?')[0]
    elif 'guidelive' in story:
        img=tree.xpath('//figure[@class="card__figure figure"]/img/@srcset')[0].split('?')[0]
    else:
        img = tree.xpath('//picture[@class="art-banner__picture"]/source/@srcset')[0].split('?')[0]
    return img

app.register_blueprint(static.static)

# Enable Werkzeug debug pages
if app_config.DEBUG:
    wsgi_app = DebuggedApplication(app, evalex=False)
else:
    wsgi_app = app

# Catch attempts to run the app directly
if __name__ == '__main__':
    print 'This command has been removed! Please run "fab app" instead!'
