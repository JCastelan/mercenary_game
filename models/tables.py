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


db.define_table('checklist',
                Field('user_email', default=get_user_email()),
                Field('title'),
                Field('memo', 'text'),
                Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
                Field('is_public', 'boolean', default=False)
                )

db.checklist.user_email.writable = False
db.checklist.user_email.readable = False
db.checklist.updated_on.writable = db.checklist.updated_on.readable = False
db.checklist.id.writable = db.checklist.id.readable = False

db.checklist.is_public.writable = False
db.checklist.is_public.readable = False

"""THIS TABLE WAS CREATED FOR THE PROJECT"""
db.define_table('userdb',
				Field( 'user_email', default=get_user_email()),
				Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
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
db.checklist.updated_on.writable = db.checklist.updated_on.readable = False

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
