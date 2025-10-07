from backend.database import engine
from sqlalchemy import inspect

insp = inspect(engine)
print("📋 Tables in your database:")
print(insp.get_table_names())
