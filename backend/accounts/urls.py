from django.urls import path
from .views import (
    signup,
    employee_me,
    copilot,
    chat_history,
    crawl_website,

    # 🔥 NEW (sessions)
    list_sessions,
    delete_session,

    # Forum
    list_questions,
    create_question,
    get_answers,
    post_answer,
    update_question,
    delete_question,
    update_answer,
    delete_answer,
    copilot_extension,
    user_profile,
)

urlpatterns = [
    # -----------------------------
    # Auth & Profile
    # -----------------------------
    path("signup/", signup),
    path("employee/me/", employee_me),
    path("profile/", user_profile),
    path("copilot/extension/", copilot_extension),
    # -----------------------------
    # Copilot
    # -----------------------------
    path("copilot/", copilot),
    path("copilot/history/", chat_history),
    path("crawl/", crawl_website),

    # 🔥 NEW SESSION ROUTES
    path("sessions/", list_sessions),
    path("sessions/delete/<str:session_id>/", delete_session),

    # -----------------------------
    # Forum APIs
    # -----------------------------
    path("forum/questions/", list_questions),
    path("forum/question/create/", create_question),

    path("forum/question/update/<int:question_id>/", update_question),
    path("forum/question/delete/<int:question_id>/", delete_question),

    path("forum/answers/<int:question_id>/", get_answers),
    path("forum/answer/<int:question_id>/", post_answer),

    path("forum/answer/update/<int:answer_id>/", update_answer),
    path("forum/answer/delete/<int:answer_id>/", delete_answer),
]