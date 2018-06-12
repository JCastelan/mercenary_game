# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

def get_user_email():
    return auth.user.email if auth.user is not None else None


"""THIS TABLE WAS CREATED FOR THE PROJECT"""
db.define_table('userdb',
				Field( 'user_email', default=get_user_email()),
				Field('created_on', 'datetime', default=datetime.datetime.utcnow()),
				Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
				#user info
				# Field( 'user_name', "string"),
				#some kind of basic counter 
				Field( 'counter', 'integer', default=0),
				#resources
				Field( 'coal', 'integer', default=0),
				# Field( 'copper', 'integer', default=0),
				# Field( 'fur', 'integer', default=0),
				# Field( 'grass', 'integer', default=0),
				Field( 'iron', 'integer', default=0),
				Field( 'mithril', 'integer', default=0),
				Field( 'steel', 'integer', default=0),
				# Field( 'stone', 'integer', default=0),
				# Field( 'tin', 'integer', default=0),
				Field( 'wood', 'integer', default=0),
				Field( 'leather', 'integer', default=0),
				#weapons
				Field( 'w_sword', 'integer', default=0),
				Field( 'i_sword', 'integer', default=0),
				Field( 's_sword', 'integer', default=0),
				Field( 'm_sword', 'integer', default=0),
				#buildings
				Field( 'houses', 'integer', default=0),
				#human units
				Field( 'workers', 'integer', default=0),
				Field( 'mages', 'integer', default=0),
				Field( 'warriors', 'integer', default=0),
				Field( 'bowmen', 'integer', default=0),
				Field( 'fighters', 'integer', default=0)
				)

#some db entries we might need: wood, iron, coal, worker, armyUnit, houses, etc.
db.userdb.user_email.writable = db.userdb.user_email.readable = False
# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
