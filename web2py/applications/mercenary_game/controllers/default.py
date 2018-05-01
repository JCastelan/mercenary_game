# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# -------------------------------------------------------------------------
# This is a sample controller
# - index is the default action of any application
# - user is required for authentication and authorization
# - download is for downloading files uploaded in the db (does streaming)
# -------------------------------------------------------------------------


def index():
	"""
	example action using the internationalization operator T and flash
	rendered by views/default/index.html or views/generic.html

	if you need a simple wiki simply replace the two lines below with:
	return auth.wiki()
	"""
	logger.info('The session is: %r' % session)
	checklists = None
	if auth.user is not None:
		checklists = db((db.checklist.user_email == auth.user.email) | (db.checklist.is_public == True)).select()
	else:
		checklists = db(db.checklist.is_public).select()
	return dict(checklists=checklists)


def no_swearing(form):
	if 'fool' in form.vars.memo:
		form.errors.memo = T('No swearing please')

def add():
	"""Adds a checklist."""
	form = SQLFORM(db.checklist)
	if form.process(onvalidation=no_swearing).accepted:
		session.flash = T("Checklist added.")
		redirect(URL('default','index'))
	elif form.errors:
		session.flash = T('Please correct the info')
	return dict(form=form)

@auth.requires_login()
@auth.requires_signature()
def delete():
	if request.args(0) is not None:
		q = ((db.checklist.user_email == auth.user.email) &
			 (db.checklist.id == request.args(0)))
		db(q).delete()
	redirect(URL('default', 'index'))


@auth.requires_login()
@auth.requires_signature()
def toggle_public():
	if request.args(0) is not None:
		q = ((db.checklist.user_email == auth.user.email) &
			 (db.checklist.id == request.args(0)))
		row = db(q).select().first()
		if row is None:
			session.flash = T('Not Authorized')
			redirect(URL('default', 'index'))
		row.is_public = not row.is_public
		row.update_record()
	redirect(URL('default', 'index'))


@auth.requires_login()
def edit():
	"""
	- "/edit/3" it offers a form to edit a checklist.
	'edit' is the controller (this function)
	'3' is request.args[0]
	"""
	if request.args(0) is None:
		# We send you back to the general index.
		redirect(URL('default', 'index'))
	else:
		q = ((db.checklist.user_email == auth.user.email) &
			 (db.checklist.id == request.args(0)))
		# I fish out the first element of the query, if there is one, otherwise None.
		cl = db(q).select().first()
		if cl is None:
			session.flash = T('Not Authorized')
			redirect(URL('default', 'index'))
		# Always write invariants in your code.
		# Here, the invariant is that the checklist is known to exist.
		# Is this an edit form?
		form = SQLFORM(db.checklist, record=cl, deletable=False)
		if form.process(onvalidation=no_swearing).accepted:
			# At this point, the record has already been edited.
			session.flash = T('Checklist edited.')
			redirect(URL('default', 'index'))
		elif form.errors:
			session.flash = T('Please enter correct values.')
	return dict(form=form)

def user():
	"""
	exposes:
	http://..../[app]/default/user/login
	http://..../[app]/default/user/logout
	http://..../[app]/default/user/register
	http://..../[app]/default/user/profile
	http://..../[app]/default/user/retrieve_password
	http://..../[app]/default/user/change_password
	http://..../[app]/default/user/bulk_register
	use @auth.requires_login()
		@auth.requires_membership('group name')
		@auth.requires_permission('read','table name',record_id)
	to decorate functions that need access control
	also notice there is http://..../[app]/appadmin/manage/auth to allow administrator to manage users
	"""
	return dict(form=auth())


@cache.action()
def download():
	"""
	allows downloading of uploaded files
	http://..../[app]/default/download/[filename]
	"""
	return response.download(request, db)


def call():
	"""
	exposes services. for example:
	http://..../[app]/default/call/jsonrpc
	decorate with @services.jsonrpc the functions to expose
	supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
	"""
	return service()


