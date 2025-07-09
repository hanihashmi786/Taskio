from rest_framework import serializers
from .models import Board, List, Card, BoardMembership
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class BoardMembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = BoardMembership
        fields = ['user', 'role', 'added_at']

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = '__all__'

class ListSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)
    class Meta:
        model = List
        fields = '__all__'

class BoardSerializer(serializers.ModelSerializer):
    lists = ListSerializer(many=True, read_only=True)
    memberships = BoardMembershipSerializer(source='boardmembership_set', many=True, read_only=True)
    class Meta:
        model = Board
        fields = '__all__'
        read_only_fields = ['created_by']
 
