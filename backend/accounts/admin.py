from django.contrib import admin
from .models import User, ChatMessage, WebsiteChunk

admin.site.register(User)
admin.site.register(ChatMessage)
admin.site.register(WebsiteChunk)