import React from 'react';
import { HighlightCard } from '../../components/HighlightCard';

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
} from './styles';

export function Dashboard() {
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
          
          <Icon name="power"/>
        </UserWrapper>
      </Header>

      <HighlightCard />
    </Container>
  )
}