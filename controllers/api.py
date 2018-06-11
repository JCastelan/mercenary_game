# Here go your api methods.

def check_logged_in():
	return response.json(dict(logged_in=auth.user is not None))
