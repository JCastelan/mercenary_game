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
		#returning user
		result = row.update_record(counter=request.vars.counter)
		return
	else:
		#new user
		result = db.userdb.insert(
			counter=request.vars.counter
		)
		return

def load_resources():
	if auth.user is None:
		return
	# print("load_counter!!!!!!!!!!!!!!!!!")
	q=(db.userdb.user_email ==auth.user.email)
	row=db(q).select().first()
	if row is None:
		# print( "\tdne")
		loaded_data = dict(

			max_health=10,
			current_health=10,
			equipped_weapon="fists",
			equipped_armor="nothing",


			coal=0,
			iron=0,
			mithril=0,
			steel=0,
			wood=0,

			leather=0,

			w_sword=0,
			i_sword=0,
			s_sword=0,
			m_sword=0,

			num_fighters=[0,0,0,0,0],
			fighter_health=[0,0,0,0,0],

		)
		return response.json(loaded_data)
	else:
		# print("\texists")
		loaded_data = dict(

			max_health=row.max_health,
			current_health=row.current_health,
			equipped_weapon=row.equipped_weapon,
			equipped_armor=row.equipped_armor,


			coal=row.coal,
			iron=row.iron,
			mithril=row.iron,
			steel=row.steel,
			wood=row.wood,


			leather=row.leather,

			w_sword=row.w_sword,
			i_sword=row.i_sword,
			s_sword=row.s_sword,
			m_sword=row.m_sword,

			num_fighters=[x.strip() for x in row.fighter_count.split(',')],
			fighter_health=[x.strip() for x in row.fighter_health.split(',')]

		)
		return response.json(loaded_data)

def save_resources():
	valueList=["coal","iron","mithril",   "steel","wood", "leather",  "w_sword","i_sword","s_sword","m_sword"]
	valuesToStore=[0,0,0,      0,0,0,0,       0,0,0,0]
	if auth.user is None:
		return
	# print "save_counter!!!!!!!!!!!!!!!!!"
	q=(db.userdb.user_email ==auth.user.email)
	row=db(q).select().first()
	print "~~~~~~~~~~~~~~~~~~~~"
	print "~~~~~~~~~~~~~~~~~~~~"
	print request.vars
	print "~~~~~~~~~~~~~~~~~~~~"
	dataCount = 0
	for value in request.vars.itervalues():
		if not isinstance(value, list):
			continue
		valuesToStore[valueList.index(value[0])]=int(value[1])
		dataCount+=1
		print "\t", value
	print "~~~~~~~~~~~~~~~~~~~~"
	print valuesToStore
	if dataCount == 0:
		return "failed"

	num_fighters_string=""
	fighter_health_string=""
	for item in request.vars.num_fighters:
		num_fighters_string+=item+","
	for item in request.vars.fighter_health:
		fighter_health_string+=item+","
	num_fighters_string = num_fighters_string[:-1]
	fighter_health_string = fighter_health_string[:-1]
	if row is not None:
		result = row.update_record(
			max_health=request.vars.max_health,
			current_health=request.vars.current_health,
			equipped_weapon=request.vars.equipped_weapon,
			equipped_armor=request.vars.equipped_armor,

			coal=valuesToStore[0],
			iron=valuesToStore[1],
			mithril=valuesToStore[2],
			steel=valuesToStore[3],
			wood=valuesToStore[4],
			leather=valuesToStore[5],

			w_sword=valuesToStore[6],
			i_sword=valuesToStore[7],
			s_sword=valuesToStore[8],
			m_sword=valuesToStore[9],

			fighter_count=num_fighters_string,
			fighter_health=fighter_health_string
		)
		print "\n\n", result, "\n\n"
		return result
	else:
		result = db.userdb.insert(
			max_health=request.vars.max_health,
			current_health=request.vars.current_health,
			equipped_weapon=request.vars.equipped_weapon,
			equipped_armor=request.vars.equipped_armor,

			coal=valuesToStore[0],
			iron=valuesToStore[1],
			mithril=valuesToStore[2],
			steel=valuesToStore[3],
			wood=valuesToStore[4],
			leather=valuesToStore[5],

			w_sword=valuesToStore[6],
			i_sword=valuesToStore[7],
			s_sword=valuesToStore[8],
			m_sword=valuesToStore[9],

			fighter_count=num_fighters_string,
			fighter_health=fighter_health_string
		)
		print "\n\n", result, "\n\n"
		return result