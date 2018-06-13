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

			food=0,

			leather_armor=0,
			iron_armor=0,
			steel_armor=0,
			mithril_armor=0,

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

			food=row.food,

			leather_armor=row.leather_armor,
			iron_armor=row.iron_armor,
			steel_armor=row.steel_armor,
			mithril_armor=row.mithril_armor,

			num_fighters=[x.strip() for x in row.fighter_count.split(',')],
			fighter_health=[x.strip() for x in row.fighter_health.split(',')]
		)
		return response.json(loaded_data)

def save_resources():
	valueList=["coal","iron","mithril","steel","wood","leather",  "w_sword","i_sword","s_sword","m_sword", "food",    "leather_armor","iron_armor","steel_armor","mithril_armor"]
	valuesToStore=[0,0,0,0,0,0,  0,0,0,0,0, 0,0,0,0]
	num_fighters_string=""
	fighter_health_string=""
	if auth.user is None:
		return
	# print "save_counter!!!!!!!!!!!!!!!!!"
	q=(db.userdb.user_email ==auth.user.email)
	row=db(q).select().first()
	print "~~~~~~~~~~~~~~~~~~~~Saving Resources~~~~~~~~~~~~~~~~~~~~"
	#print "~~~~~~~~~~~~~~~~~~~~"
	#print request.vars
	#print "~~~~~~~~~~~~~~~~~~~~"
	dataCount = 0
	for key, value in request.vars.iteritems():
		if not isinstance(value, list):
			#print "~~~not a list: \t", value
			continue
		#print "\t", value
		if len(value)>2:
			if key == "num_fighters[]":
				for item in value:
					num_fighters_string+=item+","
			elif key == "fighter_health[]":
				for item in value:
					fighter_health_string+=item+","
		else:
			#print key, value
			valuesToStore[valueList.index(value[0])]=int(value[1])
		dataCount+=1
		
	#print "~~~~~~~~~~~~~~~~~~~~"
	#print valuesToStore
	if dataCount == 0:
		return "failed"

	
	#print "~~~~~~~~~~~~~~~~~~~~"
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

			food=valuesToStore[10],

			leather_armor=valuesToStore[11],
			iron_armor=valuesToStore[12],
			steel_armor=valuesToStore[13],
			mithril_armor=valuesToStore[14],

			fighter_count=num_fighters_string,
			fighter_health=fighter_health_string
		)
		#print "\n\n", result, "\n\n"
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

			food=valuesToStore[10],

			leather_armor=valuesToStore[11],
			iron_armor=valuesToStore[12],
			steel_armor=valuesToStore[13],
			mithril_armor=valuesToStore[14],

			fighter_count=num_fighters_string,
			fighter_health=fighter_health_string
		)
		#print "\n\n", result, "\n\n"
		return result