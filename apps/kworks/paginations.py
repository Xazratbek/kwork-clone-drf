from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class KworkListPagination(PageNumberPagination):
    page_size = 20
    max_page_size = 100
    page_query_param = 'page'

    def get_paginated_response(self, data):
        return Response(
            {
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "kwork_count":self.page.paginator.count,
                "data": data
            }
        )