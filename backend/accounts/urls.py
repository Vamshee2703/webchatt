from django.urls import path
from .views import (
    signup,
    employee_me,
    copilot,
    chat_history,
    crawl_website,

    list_questions,
    create_question,
    get_answers,
    post_answer,

    update_question,
    delete_question,
    update_answer,
    delete_answer,
    user_profile,
)

urlpatterns = [
    path("signup/", signup),
    path("employee/me/", employee_me),
    path("copilot/", copilot),
    path("copilot/history/", chat_history),
    path("crawl/", crawl_website),
    path("profile/", user_profile),

    # Forum APIs
    path("forum/questions/", list_questions),
    path("forum/question/create/", create_question),

    path("forum/question/update/<int:question_id>/", update_question),
    path("forum/question/delete/<int:question_id>/", delete_question),

    path("forum/answers/<int:question_id>/", get_answers),
    path("forum/answer/<int:question_id>/", post_answer),

    path("forum/answer/update/<int:answer_id>/", update_answer),
    path("forum/answer/delete/<int:answer_id>/", delete_answer),
]