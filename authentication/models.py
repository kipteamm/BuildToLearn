from django.db import models

from utils import snowflakes





class User(models.Model):
    # Identifiers
    id = snowflakes.SnowflakeIDField(primary_key=True, unique=True)
    
    email_address = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    salt = models.CharField(max_length=255)

    token = models.CharField(max_length=255, null=True, blank=True)

    # Permissions
    permissions = models.IntegerField(default=1)

    # Time records
    creation_timestamp = models.FloatField()

    def to_dict(self) -> dict:
        return {
            'user_id' : self.id,
            'email_address' : self.email_address,
            'creation_timestamp' : self.creation_timestamp
        }