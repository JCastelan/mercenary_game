# Here go your api methods.

#@auth.requires_signature() #need to fix this
def load_counter():
	print("load_counter!!!!!!!!!!!!!!!!!")
	q=(db.userdb.user_email == auth.user.email)
	row=db(q).select().first()
	if row is None:
		print( "\t[load]This is a new user")
		return response.json(dict(counter=0))
	else:
		print("\t[load]This is a returning user")
		return response.json(dict(counter=row.counter))

#@auth.requires_signature()
def save_counter():
	print "\t[save]Attempting to save counter ",request.vars.counter,"!!!!!!!!!!!!!!!!!"
	q=(db.userdb.user_email ==auth.user.email)
	row=db(q).select().first()
	if row is None:
		print( "\t[save]This is a new user")
		entry_id = db.userdb.insert(
			counter=request.vars.counter
		)
		entry = db.userdb(entry_id)
		print entry
		return response.json(dict(entry=entry))
	else:
		print("\t[save]This is a returning user")
		q=(db.userdb.user_email == auth.user.email) #b/c each user only has one row
		row=db(q).select().first()
		row.update_record(  counter=request.vars.counter)
		return response.json(dict(row=row))
	#result = row.update_record(counter=request.vars.counter)
	#return result
	