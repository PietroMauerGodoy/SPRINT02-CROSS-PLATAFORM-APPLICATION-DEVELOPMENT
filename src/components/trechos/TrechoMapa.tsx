import MapView, { Marker, Callout } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';
import { KanbanItem, SeveridadeVegetacao } from '../../types';

const SEVERIDADE_COR: Record<SeveridadeVegetacao, string> = {
  sem_ocorrencia: '#7C3AED',
  leve: '#16A34A',
  grave: '#D97706',
  critico: '#DC2626',
};

type Props = {
  trechos: KanbanItem[];
  selecionadoId: string | null;
  onSelecionar: (item: KanbanItem) => void;
};

function temCoordenadaValida(t: KanbanItem): boolean {
  return typeof t.lat === 'number' && typeof t.lon === 'number' && !Number.isNaN(t.lat) && !Number.isNaN(t.lon);
}

// Mapa nativo (react-native-maps) — usa o Apple Maps no iOS (sem chave) e o
// Google Maps no Android (no Expo Go a chave de desenvolvimento do próprio
// Expo já cobre o teste; uma build standalone precisaria de uma chave própria
// em app.json → android.config.googleMaps.apiKey, ver README). Mesma lógica
// de dados do mapa web (TrechoMapa.web.tsx): ignora qualquer trecho sem
// coordenada válida em vez de quebrar a tela.
export default function TrechoMapa({ trechos, selecionadoId, onSelecionar }: Props) {
  const validos = trechos.filter(temCoordenadaValida);

  if (validos.length === 0) {
    return null;
  }

  const lats = validos.map((t) => t.lat);
  const lons = validos.map((t) => t.lon);
  const centroLat = lats.reduce((acc, v) => acc + v, 0) / validos.length;
  const centroLon = lons.reduce((acc, v) => acc + v, 0) / validos.length;
  const spreadLat = Math.max(...lats) - Math.min(...lats);
  const spreadLon = Math.max(...lons) - Math.min(...lons);

  return (
    <MapView
      style={s.mapa}
      initialRegion={{
        latitude: centroLat,
        longitude: centroLon,
        latitudeDelta: Math.max(0.15, spreadLat * 1.6),
        longitudeDelta: Math.max(0.15, spreadLon * 1.6),
      }}
    >
      {validos.map((t) => {
        const ativo = t.id === selecionadoId;
        return (
          <Marker
            key={t.id}
            coordinate={{ latitude: t.lat, longitude: t.lon }}
            pinColor={SEVERIDADE_COR[t.severidade]}
            opacity={ativo ? 1 : 0.85}
            onPress={() => onSelecionar(t)}
          >
            <Callout>
              <View style={s.callout}>
                <Text style={s.calloutTitulo}>{t.nomeEquipe}</Text>
                <Text style={s.calloutTxt}>{t.rodovia} · Km {t.kmInicio}-{t.kmFim}</Text>
              </View>
            </Callout>
          </Marker>
        );
      })}
    </MapView>
  );
}

const s = StyleSheet.create({
  mapa: { flex: 1, borderRadius: 16 },
  callout: { minWidth: 140, padding: 4 },
  calloutTitulo: { fontWeight: '700', marginBottom: 2 },
  calloutTxt: { fontSize: 12, color: '#555' },
});
