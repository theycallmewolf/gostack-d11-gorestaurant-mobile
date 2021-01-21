import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Image } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import api from '../../services/api';

import {
  Container,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalContainer,
  Title,
  TotalContainer,
  AdicionalItem,
  AdicionalItemText,
  AdicionalQuantity,
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  formattedPrice: string;
  extras: Extra[];
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  useEffect(() => {
    async function loadFood(): Promise<void> {
      // Load a specific food with extras based on routeParams id
      api.get(`foods/${routeParams.id}`).then(response => {
        const selectedFood = response.data as Food;
        setFood(selectedFood);
        selectedFood.extras.map((extra: Extra) => {
          // eslint-disable-next-line no-param-reassign
          extra.quantity = 1;
          return extra;
        });
        setExtras(selectedFood.extras);
      });

      const response = await api.get('favorites');
      const favorites = response.data as Food[];
      const checkIsFavorite = favorites.filter(
        favorite => favorite.id === food.id,
      );
      if (checkIsFavorite.length === 1) {
        setIsFavorite(true);
      }
    }

    loadFood();
  }, [food.id, routeParams]);

  function handleIncrementExtra(id: number): void {
    // Increment extra quantity
    const extrasIncreased = extras.map(extra => {
      if (extra.id === id) {
        // eslint-disable-next-line no-param-reassign
        extra.quantity += 1;
      }
      return extra;
    });

    setExtras(extrasIncreased);
  }

  function handleDecrementExtra(id: number): void {
    // Decrement extra quantity
    const extrasDecreased = extras.map(extra => {
      if (extra.id === id) {
        if (extra.quantity === 0) {
          // eslint-disable-next-line no-param-reassign
          extra.quantity = 0;
        } else {
          // eslint-disable-next-line no-param-reassign
          extra.quantity -= 1;
        }
      }
      return extra;
    });

    setExtras(extrasDecreased);
  }

  function handleIncrementFood(): void {
    // Increment food quantity
    setFoodQuantity(foodQuantity + 1);
  }

  function handleDecrementFood(): void {
    // Decrement food quantity
    if (foodQuantity === 0) {
      setFoodQuantity(foodQuantity);
    } else {
      setFoodQuantity(foodQuantity - 1);
    }
  }

  const toggleFavorite = useCallback(async () => {
    // Toggle if food is favorite or not
    api.post('favorites', food);
    setIsFavorite(!isFavorite);
  }, [isFavorite, food]);

  const cartTotal = useMemo(() => {
    // Calculate cartTotal
  }, [extras, food, foodQuantity]);

  async function handleFinishOrder(): Promise<void> {
    // Finish the order and save on the API
  }

  // Calculate the correct icon name
  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <Container>
      <Header />

      <ScrollContainer>
        <FoodsContainer>
          <Food>
            <FoodImageContainer>
              <Image
                style={{ width: 327, height: 183 }}
                source={{
                  uri: food.image_url,
                }}
              />
            </FoodImageContainer>
            <FoodContent>
              <FoodTitle>{food.name}</FoodTitle>
              <FoodDescription>{food.description}</FoodDescription>
              <FoodPricing>{food.formattedPrice}</FoodPricing>
            </FoodContent>
          </Food>
        </FoodsContainer>
        <AdditionalContainer>
          <Title>Adicionais</Title>
          {extras.map(extra => (
            <AdicionalItem key={extra.id}>
              <AdicionalItemText>{extra.name}</AdicionalItemText>
              <AdicionalQuantity>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="minus"
                  onPress={() => handleDecrementExtra(extra.id)}
                  testID={`decrement-extra-${extra.id}`}
                />
                <AdicionalItemText testID={`extra-quantity-${extra.id}`}>
                  {extra.quantity}
                </AdicionalItemText>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="plus"
                  onPress={() => handleIncrementExtra(extra.id)}
                  testID={`increment-extra-${extra.id}`}
                />
              </AdicionalQuantity>
            </AdicionalItem>
          ))}
        </AdditionalContainer>
        <TotalContainer>
          <Title>Total do pedido</Title>
          <PriceButtonContainer>
            <TotalPrice testID="cart-total">{cartTotal}</TotalPrice>
            <QuantityContainer>
              <Icon
                size={15}
                color="#6C6C80"
                name="minus"
                onPress={handleDecrementFood}
                testID="decrement-food"
              />
              <AdicionalItemText testID="food-quantity">
                {foodQuantity}
              </AdicionalItemText>
              <Icon
                size={15}
                color="#6C6C80"
                name="plus"
                onPress={handleIncrementFood}
                testID="increment-food"
              />
            </QuantityContainer>
          </PriceButtonContainer>

          <FinishOrderButton onPress={() => handleFinishOrder()}>
            <ButtonText>Confirmar pedido</ButtonText>
            <IconContainer>
              <Icon name="check-square" size={24} color="#fff" />
            </IconContainer>
          </FinishOrderButton>
        </TotalContainer>
      </ScrollContainer>
    </Container>
  );
};

export default FoodDetails;
