def fetch_user_profile(user_id, database):
    # Pretend database is a dict for simplicity
    if user_id in database:
        return database[user_id]
    return None