# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime
import random

def get_user_email():
    return auth.user.email if auth.user is not None else None

"""THIS TABLE WAS CREATED FOR THE PROJECT"""
db.define_table('userdb',
				Field( 'user_email', default=get_user_email()),
				Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
				#user info
				Field( 'user_name', 'string', default="new_user_"+str(random.randint(0,999999999))),
				#some kind of basic counter 
				Field( 'counter', 'integer', default=0),
				#resources
				Field( 'wood', 'integer', default=0),
				Field( 'iron', 'integer', default=0),
				Field( 'coal', 'integer', default=0),
				#buildings
				Field( 'houses', 'integer', default=0),
				#human units
				Field( 'workers', 'integer', default=0),
				Field( 'fighters', 'integer', default=0)
				)

#some db entries we might need: wood, iron, coal, worker, armyUnit, houses, etc.
db.userdb.user_email.writable = db.userdb.user_email.readable = False

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
