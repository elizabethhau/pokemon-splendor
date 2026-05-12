import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import GameSetupScreen from '../screens/GameSetupScreen';
import GameBoardScreen from '../screens/GameBoardScreen';
import GameOverScreen from '../screens/GameOverScreen';
import RulebookScreen from '../screens/RulebookScreen';
import StatsScreen from '../screens/StatsScreen';
import PokedexScreen from '../screens/PokedexScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  GameSetup: undefined;
  GameBoard: undefined;
  GameOver: undefined;
  Rulebook: undefined;
  Stats: undefined;
  Pokedex: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Pokemon Splendor' }} />
        <Stack.Screen name="GameSetup" component={GameSetupScreen} options={{ title: 'New Game' }} />
        <Stack.Screen name="GameBoard" component={GameBoardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GameOver" component={GameOverScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Rulebook" component={RulebookScreen} options={{ title: 'How to Play' }} />
        <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'Stats' }} />
        <Stack.Screen name="Pokedex" component={PokedexScreen} options={{ title: 'Pokedex' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
