import React, { useCallback, useEffect, useState } from 'react';
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
  LogoutButton,
} from './styles';

import { getDateFormatted, getNumberFormatted } from '../../utils/util';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
}
interface HighlightData {
  entries: HighlightProps;
  expensives: HighlightProps;
  total: HighlightProps;
}

export function Dashboard() {
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);

  async function loadTransactions() {
    const dataKey = '@gofinances:transactions';
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

    total = entriesTotal - expensivesTotal;

    setHighlightData({
      entries: {
        amount: getNumberFormatted(entriesTotal)
      },
      expensives: {
        amount: getNumberFormatted(expensivesTotal)
      },
      total: {
        amount: getNumberFormatted(total)
      }
    });
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  useFocusEffect(useCallback(() => {
    loadTransactions();
  }, []));

  return (
    <Container>
      <Header>
        <UserWrapper>
          <UserInfo>
            <Photo source={{ uri: 'https://github.com/brunofray.png' }}/>
            <User>
              <UserGreeting>Olá, </UserGreeting>
              <UserName>Bruno</UserName>
            </User>
          </UserInfo>
          
          <LogoutButton onPress={() => {}}>
            <Icon name="power"/>
          </LogoutButton>
        </UserWrapper>
      </Header>

      <HighlightCards>
        <HighlightCard title="Entradas" amount={highlightData.entries.amount} lastTransaction="Última entrada dia 13 de abril" type="up"/>
        <HighlightCard title="Saídas" amount={highlightData.expensives.amount} lastTransaction="Última saída dia 03 de abril" type="down"/>
        <HighlightCard title="Total" amount={highlightData.total.amount} lastTransaction="01 à 16 de abril" type="total"/>
      </HighlightCards>

      <Transactions>
        <Title>Listagem</Title>

        <TransactionList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TransactionCard data={item} />}
        />
      </Transactions>
    </Container>
  )
}