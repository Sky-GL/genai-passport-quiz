import { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CATEGORIES, EXAM_MODE, BATCH_OPTIONS } from './quiz-data';

export default function SelectScreen() {
  const [batchCount, setBatchCount] = useState(10);
  const router = useRouter();

  const startQuiz = (catId) => {
    router.push({
      pathname: '/quiz',
      params: { catId, batchCount: String(batchCount) }
    });
  };

  return (
    <LinearGradient colors={['#0f172a', '#1a1040', '#0f172a']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.subtitle}>AI-Powered Study</Text>
            <Text style={styles.title}>🤖 生成AIパスポート{'\n'}試験対策</Text>
          </View>

          {/* Batch selector */}
          <View style={styles.batchBox}>
            <Text style={styles.batchLabel}>出題数を選ぶ</Text>
            <View style={styles.batchRow}>
              {BATCH_OPTIONS.map(n => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setBatchCount(n)}
                  style={[styles.batchBtn, batchCount === n && styles.batchBtnActive]}
                >
                  <Text style={[styles.batchBtnText, batchCount === n && styles.batchBtnTextActive]}>
                    {n}問
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.batchNote}>⚡ 解きながら裏で次を生成</Text>
          </View>

          {/* 本番モード */}
          <TouchableOpacity onPress={() => startQuiz('exam')} activeOpacity={0.85}>
            <LinearGradient
              colors={['rgba(249,115,22,0.15)', 'rgba(234,88,12,0.08)']}
              style={styles.examCard}
            >
              <Text style={styles.examEmoji}>🎓</Text>
              <View style={styles.examInfo}>
                <View style={styles.examTitleRow}>
                  <Text style={styles.examTitle}>本番モード</Text>
                  <View style={styles.examBadge}>
                    <Text style={styles.examBadgeText}>全分野シャッフル</Text>
                  </View>
                </View>
                <Text style={styles.examDesc}>6分野からランダム出題。本試験と同じ混合形式！</Text>
                <Text style={styles.examCount}>{batchCount}問スタート →</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Category grid */}
          <Text style={styles.sectionLabel}>▸ 分野別練習</Text>
          <View style={styles.grid}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => startQuiz(c.id)}
                activeOpacity={0.85}
                style={styles.catCardWrapper}
              >
                <LinearGradient
                  colors={[`${c.color}25`, `${c.color}08`]}
                  style={[styles.catCard, { borderColor: `${c.color}55` }]}
                >
                  <Text style={styles.catEmoji}>{c.emoji}</Text>
                  <Text style={styles.catLabel}>{c.label}</Text>
                  <Text style={styles.catDesc}>{c.desc}</Text>
                  <Text style={[styles.catStart, { color: c.color }]}>{batchCount}問 →</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  subtitle: { fontSize: 11, color: '#a78bfa', fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', lineHeight: 32 },
  batchBox: {
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  batchLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 12 },
  batchRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  batchBtn: {
    paddingVertical: 10, paddingHorizontal: 24,
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  batchBtnActive: {
    backgroundColor: '#7c3aed', borderColor: '#7c3aed',
  },
  batchBtnText: { color: '#94a3b8', fontWeight: '700', fontSize: 15 },
  batchBtnTextActive: { color: '#fff' },
  batchNote: { color: '#475569', fontSize: 11 },
  examCard: {
    borderRadius: 18, borderWidth: 2, borderColor: 'rgba(249,115,22,0.4)',
    padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16,
    marginBottom: 20,
  },
  examEmoji: { fontSize: 40 },
  examInfo: { flex: 1 },
  examTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  examTitle: { fontSize: 18, fontWeight: '800', color: '#f1f5f9' },
  examBadge: {
    backgroundColor: 'rgba(249,115,22,0.25)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  examBadgeText: { color: '#fdba74', fontSize: 10, fontWeight: '700' },
  examDesc: { color: '#94a3b8', fontSize: 12, marginBottom: 8 },
  examCount: { color: '#f97316', fontSize: 13, fontWeight: '700' },
  sectionLabel: { color: '#475569', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catCardWrapper: { width: '47%' },
  catCard: {
    borderRadius: 16, borderWidth: 1, padding: 16,
  },
  catEmoji: { fontSize: 28, marginBottom: 8 },
  catLabel: { fontSize: 14, fontWeight: '800', color: '#f1f5f9', marginBottom: 4 },
  catDesc: { fontSize: 10, color: '#64748b', lineHeight: 15, marginBottom: 12 },
  catStart: { fontSize: 12, fontWeight: '700' },
});
