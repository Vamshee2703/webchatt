from django.contrib import admin
from .models import User, ChatMessage, WebsiteChunk,Question,Answer,ChatSession

admin.site.register(User)
admin.site.register(ChatMessage)
admin.site.register(WebsiteChunk)
admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(ChatSession)