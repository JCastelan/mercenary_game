# Here go your api methods.

def get_name():
	if auth.user is None:
		return response.json(dict(logged_in = False))
	
	r = db(db.auth_user.email == auth.user.email).select().first()
	return response.json(dict(
		logged_in = auth.user is not None,
		name = r.first_name
		))

# @auth.requires_signature() # TODO: need to fix this
def load_counter():
	if auth.user is None:
		return
	# print("load_counter!!!!!!!!!!!!!!!!!")
	q=(db.userdb.user_email ==auth.user.email)
	row=db(q).select().first()
	if row is None:
		# print( "\tdne")
		return response.json(dict(counter=0))
	else:
		# print("\texists")
		return response.json(dict(counter=row.counter))

# @auth.requires_signature()
def save_counter():
	if auth.user is None:
		return
	# print "save_counter!!!!!!!!!!!!!!!!!"
	q=(db.userdb.user_email ==auth.user.email)
	row=db(q).select().first()
	if row is not None:
		result = row.update_record(counter=request.vars.counter)
		return
	else:
		result = db.userdb.insert()
		return

def load_resources():
	if auth.user is None:
		return
	# print("load_counter!!!!!!!!!!!!!!!!!")
	q=(db.userdb.user_email ==auth.user.email)
	row=db(q).select().first()
	if row is None:
		# print( "\tdne")
		return response.json(dict(counter=0))
	else:
		# print("\texists")
		return response.json(dict(counter=row.counter))

def save_resources():
	if auth.user is None:
		return
	# print "save_counter!!!!!!!!!!!!!!!!!"
	q=(db.userdb.user_email ==auth.user.email)
	row=db(q).select().first()
	if row is not None:
		result = row.update_record(counter=request.vars.counter)
		return
	else:
		result = db.userdb.insert()
		return