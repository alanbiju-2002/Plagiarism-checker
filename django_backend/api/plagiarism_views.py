from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .nlp_service import get_hybrid_score

class PlagiarismCheckView(APIView):
    def post(self, request):
        text1 = request.data.get('text1', '')
        text2 = request.data.get('text2', '')
        
        if not text1 or not text2:
            return Response(
                {"error": "Both text1 and text2 are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            results = get_hybrid_score(text1, text2)
            return Response(results, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
