import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

const API_KEY = '2ecd69c';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalResults, setTotalResults] = useState(0);

  const fetchMoviesWithRatings = async (basicMovies) => {
    return await Promise.all(
      basicMovies.map(async (movie) => {
        try {
          const detailRes = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`);
          const detailData = await detailRes.json();
          return { ...movie, imdbRating: detailData.imdbRating || 'N/A' };
        } catch (e) {
          return { ...movie, imdbRating: 'N/A' };
        }
      })
    );
  };

  const searchMovies = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setMovies([]);
    setPage(1);

    try {
      const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&page=1`);
      const data = await response.json();

      if (data.Response === 'True') {
        const moviesWithRatings = await fetchMoviesWithRatings(data.Search);
        setMovies(moviesWithRatings);
        setTotalResults(parseInt(data.totalResults, 10));
        setPage(2);
      } else {
        setError(data.Error);
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMovies = async () => {
    if (loading || movies.length >= totalResults) return;

    setLoading(true);
    try {
      const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&page=${page}`);
      const data = await response.json();

      if (data.Response === 'True') {
        const newMoviesWithRatings = await fetchMoviesWithRatings(data.Search);
        setMovies((prevMovies) => [...prevMovies, ...newMoviesWithRatings]);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const renderMovie = ({ item }) => (
    <TouchableOpacity 
      style={styles.movieCard}
      onPress={() => navigation.navigate('Details', { imdbID: item.imdbID })}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.Poster !== 'N/A' ? item.Poster : 'https://via.placeholder.com/100x150?text=No+Poster' }} 
        style={styles.poster} 
      />
      <View style={styles.movieInfo}>
        <Text style={styles.title} numberOfLines={2}>{item.Title}</Text>
        <Text style={styles.year}>{item.Year}</Text>
        
        <View style={styles.bottomRow}>
          <Text style={styles.type}>
            {item.Type.charAt(0).toUpperCase() + item.Type.slice(1)}
          </Text>
          <Text style={styles.rating}>⭐ {item.imdbRating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchMovies}
          returnKeyType="search"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchMovies}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={movies}
        keyExtractor={(item, index) => item.imdbID + index}
        renderItem={renderMovie}
        onEndReached={loadMoreMovies}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && movies.length > 0 ? <ActivityIndicator size="large" color="#38BDF8" style={{ margin: 20 }} /> : null}
        ListEmptyComponent={loading && movies.length === 0 ? <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 50 }} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  input: {
    flex: 1,
    backgroundColor: '#334155',
    color: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 16,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#38BDF8',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  searchButtonText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  movieCard: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 5,
    backgroundColor: '#334155',
  },
  movieInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 5,
  },
  year: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    fontSize: 12,
    color: '#38BDF8',
  },
  rating: {
    fontSize: 14,
    color: '#FCD34D',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  }
});