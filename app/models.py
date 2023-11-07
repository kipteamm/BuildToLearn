from django.db import models

from utils import snowflakes


class Game(models.Model):
    id = snowflakes.SnowflakeIDField(primary_key=True, unique=True)
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE)

    name = models.CharField(max_length=200)

    theme = models.CharField(max_length=200)

    resource_1 = models.CharField(max_length=200)
    resource_2 = models.CharField(max_length=200)
    resource_3 = models.CharField(max_length=200)

    last_activity_timestamp = models.BigIntegerField()
    creation_timestamp = models.BigIntegerField()