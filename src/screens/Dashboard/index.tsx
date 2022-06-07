import React, { useCallback, useEffect, useState } from 'react';
import * as Device from 'expo-device';
import { ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';

import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';

import { 
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  HeaderIcons,
  NotificationButton,
  LogoutButton,
  LoadContainer,
} from './styles';

import { getDateFormatted, getNamDateFormatted, getNumberFormatted } from '../../utils/util';
import { useTheme } from 'styled-components';
import { useAuth } from '../../hooks/auth';
import { MessageProps, usePushNotification } from '../../hooks/push-notification';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
  lastTransaction: string;
}
interface HighlightData {
  entries: HighlightProps;
  expensives: HighlightProps;
  total: HighlightProps;
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);

  const theme = useTheme();
  const { signOut, user } = useAuth();
  const { sendPushNotification, expoPushToken } = usePushNotification();

  const messageNotification = {
    to: expoPushToken,
    sound: 'default',
    title: 'GoFinances',
    body: 'Suas finanças em dia!',
    data: { someData: 'goes here' },
  } as unknown as MessageProps;

  async function handleSendPushNotification(messageNotification: MessageProps) {
    try {
      await sendPushNotification(messageNotification);
    } catch (error) {
      console.log(error);
      Alert.alert('Não foi possível enviar uma notificação');
    }
  }

  function getLastTransactionDate(
    collection: DataListProps[],
    type: 'positive' | 'negative'
  ) {
    const collectionFilttered = collection
    .filter(transaction => transaction.type === type);

    if ( collectionFilttered.length === 0 ) {
      return '';
    }

    const lastTransaction = 
    Math.max.apply(Math, collectionFilttered
    .map(transaction => new Date(transaction.date).getTime()));

    return getNamDateFormatted(new Date(lastTransaction));
  }

  async function loadTransactions() {
    const dataKey = `@gofinances:transactions_user:${user}`;
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let expensivesTotal = 0;
    let total = 0;

    const transactionsFormatted: DataListProps[] = transactions
    .map((item: DataListProps) => {

      if ( item.type === 'positive' ) {
        entriesTotal += Number(item.amount);
      } else {
        expensivesTotal += Number(item.amount);
      }

      const amount = getNumberFormatted( Number(item.amount) );
      const date = getDateFormatted( new Date(item.date) );

      return {
        id: item.id,
        name: item.name,
        amount,
        type: item.type,
        category: item.category,
        date,
      }
    });

    setTransactions(transactionsFormatted);
    const lastTransactionEntries = getLastTransactionDate(transactions, 'positive');
    const lastTransactionExpensives = getLastTransactionDate(transactions, 'negative');
    const totalInterval = lastTransactionExpensives !== '' ? `01 a ${lastTransactionExpensives}` : 'Não há movimentações';

    total = entriesTotal - expensivesTotal;

    setHighlightData({
      entries: {
        amount: getNumberFormatted(entriesTotal),
        lastTransaction: lastTransactionEntries !== '' ? `Última entrada dia ${lastTransactionEntries}` : 'Não há entrada',
      },
      expensives: {
        amount: getNumberFormatted(expensivesTotal),
        lastTransaction: lastTransactionExpensives !== '' ? `Última saída dia ${lastTransactionExpensives}` : 'Não há saída',
      },
      total: {
        amount: getNumberFormatted(total),
        lastTransaction: totalInterval,
      }
    });

    setIsLoading(false);
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  useFocusEffect(useCallback(() => {
    loadTransactions();
  }, []));

  return (
    <Container>
      {
        isLoading ? 
        <LoadContainer>
          <ActivityIndicator
            color={theme.colors.primary}
            size="large"
          />
        </LoadContainer> :
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo source={{ uri: user.photo }}/>
                <User>
                  <UserGreeting>Olá, </UserGreeting>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>
              
              <HeaderIcons>
                {
                  Device.isDevice &&
                  <NotificationButton onPress={() => handleSendPushNotification(messageNotification)}>
                    <Icon name="bell"/>
                  </NotificationButton>
                }
                <LogoutButton onPress={signOut}>
                  <Icon name="power"/>
                </LogoutButton>
              </HeaderIcons>
            </UserWrapper>
          </Header>

          <HighlightCards>
            <HighlightCard title="Entradas" amount={highlightData.entries.amount} lastTransaction={highlightData.entries.lastTransaction} type="up"/>
            <HighlightCard title="Saídas" amount={highlightData.expensives.amount} lastTransaction={highlightData.expensives.lastTransaction} type="down"/>
            <HighlightCard title="Total" amount={highlightData.total.amount} lastTransaction={highlightData.total.lastTransaction} type="total"/>
          </HighlightCards>

          <Transactions>
            <Title>Listagem</Title>

            <TransactionList
              data={transactions}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
            />
          </Transactions>
        </>
      }
    </Container>
  )
}