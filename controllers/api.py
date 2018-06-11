# Here go your api methods.

def check_logged_in():
	return response.json(dict(logged_in=auth.user is not None))

# @auth.requires_signature() # TODO: need to fix this
def load_counter():
	print("load_counter!!!!!!!!!!!!!!!!!")
	q=(db.userdb.user_email ==auth.user.email)
	row=db(q).select().first()
	#row=db().select(q).first()
	if row is None:
		print( "\tdne")
		return response.json(dict(counter=0))
	else:
		print("\texists")
		return response.json(dict(counter=row.counter))

# @auth.requires_signature()
def save_counter():
	print "save_counter!!!!!!!!!!!!!!!!!"
	q=(db.userdb.user_email ==auth.user.email)
	row=db(q).select().first()
	result = row.update_record(counter=request.vars.counter)
	return result
