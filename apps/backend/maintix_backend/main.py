from fastapi import FastAPI
from maintix_backend.operations import register_lifespan, register_routes

app = FastAPI(title='Maintix Backend', version='0.1.0')

register_routes(app)
register_lifespan(app)
