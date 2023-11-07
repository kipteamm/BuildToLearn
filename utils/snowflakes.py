from django.db import models

import time


class SnowflakeIDField(models.CharField):
    def __init__(self, *args, **kwargs):
        kwargs['editable'] = False
        kwargs['max_length'] = 255
        super().__init__(*args, **kwargs)

class SnowflakeGenerator:
    def __init__(self):
        self.machine_id = 1
        self.sequence = 0
        self.last_timestamp = -1

    def generate_id(self):
        current_timestamp = int(time.time() * 1000)

        if current_timestamp == self.last_timestamp:
            self.sequence = (self.sequence + 1) & 4095
            if self.sequence == 0:
                # Wait for the next millisecond
                current_timestamp = self.wait_for_next_ms(current_timestamp)
        else:
            self.sequence = 0

        self.last_timestamp = current_timestamp

        snowflake_id = (
            (current_timestamp << 22)
            | (self.machine_id << 12)
            | self.sequence
        )

        return snowflake_id

    def wait_for_next_ms(self, last_timestamp):
        current_timestamp = int(time.time() * 1000)

        while current_timestamp <= last_timestamp:
            current_timestamp = int(time.time() * 1000)

        return current_timestamp