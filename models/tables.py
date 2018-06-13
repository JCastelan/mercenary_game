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


db.define_table('userdb',
				Field( 'user_email', default=get_user_email()),
				Field('created_on', 'datetime', default=datetime.datetime.utcnow()),
				Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
				#player info
				Field( 'max_health', 'integer', default=10),
				Field( 'current_health', 'integer', default=10),
				Field( 'equipped_weapon', 'string', default="fists"),
				Field( 'equipped_armor', 'string', default="nothing"),
				#resources
				Field( 'coal', 'integer', default=0),
				Field( 'iron', 'integer', default=0),
				Field( 'mithril', 'integer', default=0),
				Field( 'steel', 'integer', default=0),
				Field( 'wood', 'integer', default=0),
				Field( 'leather', 'integer', default=0),
				#weapons
				Field( 'w_sword', 'integer', default=0),
				Field( 'i_sword', 'integer', default=0),
				Field( 's_sword', 'integer', default=0),
				Field( 'm_sword', 'integer', default=0),

				#armor
				Field( 'leather_armor', 'integer', default=0),
				Field( 'iron_armor', 'integer', default=0),
				Field( 'steel_armor', 'integer', default=0),
				Field( 'mithril_armor', 'integer', default=0),

				#other items
				Field( 'food', 'integer', default=0),

				#human units
				Field( 'fighter_count', 'string', default="0,0,0,0,0"),
				Field( 'fighter_health', 'string', default="0,0,0,0,0"),

				Field( 'c_miners', 'integer', default=0),
				Field( 'i_miners', 'integer', default=0),
				Field( 'm_miners', 'integer', default=0),
				Field( 'hunters', 'integer', default=0),
				)

#some db entries we might need: wood, iron, coal, worker, armyUnit, houses, etc.
db.userdb.user_email.writable = db.userdb.user_email.readable = False
# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
