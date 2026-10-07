import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';

const API_KEY = '2ecd69c';

export default function DetailsScreen({ route }) {
  const { imdbID } = route.params;
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=full`);
        const data = await response.json();

        if (data.Response === 'True') {
          setMovie(data);
        } else {
          setError(data.Error);
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [imdbID]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Movie not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} bounces={false}>
      <Image 
        source={{ uri: movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster' }} 
        style={styles.poster} 
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{movie.Title}</Text>
        <Text style={styles.meta}>{movie.Year} | {movie.Runtime} | {movie.Genre}</Text>
        
        <View style={styles.ratingBox}>
          <Text style={styles.ratingText}>⭐ {movie.imdbRating} / 10</Text>
        </View>
        
        <Text style={styles.sectionTitle}>Plot</Text>
        <Text style={styles.plot}>{movie.Plot}</Text>
        
        <Text style={styles.sectionTitle}>Cast</Text>
        <Text style={styles.text}>{movie.Actors}</Text>
        
        <Text style={styles.sectionTitle}>Director</Text>
        <Text style={styles.text}>{movie.Director}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  centered: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  poster: {
    width: '100%',
    height: 450,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 5,
  },
  meta: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 15,
  },
  ratingBox: {
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  ratingText: {
    color: '#FCD34D',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#38BDF8',
    marginTop: 15,
    marginBottom: 5,
  },
  plot: {
    fontSize: 15,
    color: '#CBD5E1',
    lineHeight: 22,
  },
  text: {
    fontSize: 15,
    color: '#F8FAFC',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  }
});