import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getCatInfo } from './quiz-data';

export default function ResultScreen() {
  const { catId, batchCount: batchStr, answers: answersStr, questions: questionsStr } = useLocalSearchParams();
  const router = useRouter();
  const batchCount = parseInt(batchStr);
  const answers = JSON.parse(answersStr || '{}');
  const questions = JSON.parse(questionsStr || '[]');
  const cat = getCatInfo(catId);

  const score = Object.entries(answers).filter(([i, c]) => questions[i]?.correct === c).length;
  const pct = Math.round(score / batchCount * 100);

  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚';
  const message = pct >= 80 ? '素晴らしい！合格レベルです🎉' : pct >= 60 ? 'もう少し！苦手分野を復習しましょう' : '基礎から復習がおすすめ！';

  return (
    <LinearGradient colors={['#0f172a', '#1a1040', '#0f172a']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>

          <View style={styles.card}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.score}>{score} / {batchCount}</Text>
            <Text style={styles.pct}>正解率 {pct}%</Text>
            <Text style={styles.message}>{message}</Text>

            {/* Result bar */}
            <View style={styles.barBg}>
              <LinearGradient
                colors={pct >= 80 ? ['#22c55e', '#16a34a'] : pct >= 60 ? ['#f59e0b', '#d97706'] : ['#ef4444', '#dc2626']}
                style={[styles.barFill, { width: `${pct}%` }]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              />
            </View>

            <Text style={styles.listTitle}>▸ 問題一覧</Text>
            {questions.slice(0, batchCount).map((q, i) => {
              const userChoice = answers[i];
              const correct = q.correct === userChoice;
              return (
                <View key={i} style={[styles.row, { borderColor: correct ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', backgroundColor: correct ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }]}>
                  <Text style={styles.rowMark}>{correct ? '✅' : '❌'}</Text>
                  <Text style={styles.rowNum}>Q{i + 1}</Text>
                  <Text style={styles.rowQ} numberOfLines={2}>{q.questionText}</Text>
                  {!correct && <Text style={styles.rowCorrect}>正解:{q.correct}</Text>}
                </View>
              );
            })}

            <View style={styles.btnRow}>
              <TouchableOpacity
                onPress={() => router.replace({ pathname: '/quiz', params: { catId, batchCount: String(batchCount) } })}
                activeOpacity={0.85}
                style={styles.btnWrapper}
              >
                <LinearGradient colors={[cat?.color || '#8b5cf6', '#6366f1']} style={styles.btn}>
                  <Text style={styles.btnText}>もう一度挑戦 ↩</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.replace('/')} activeOpacity={0.85} style={styles.btnWrapper}>
                <View style={styles.btnOutline}>
                  <Text style={styles.btnOutlineText}>カテゴリ選択へ</Text>
                </View>
              </TouchableOpacity>
            </View>
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
  card: { backgroundColor: 'rgba(26,16,64,0.8)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)', padding: 24 },
  emoji: { fontSize: 56, textAlign: 'center', marginBottom: 12 },
  score: { fontSize: 36, fontWeight: '800', color: '#f1f5f9', textAlign: 'center' },
  pct: { color: '#94a3b8', fontSize: 16, textAlign: 'center', marginBottom: 6 },
  message: { color: '#c4b5fd', fontSize: 15, fontWeight: '600', textAlign: 'center', marginBottom: 24 },
  barBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', marginBottom: 28 },
  barFill: { height: '100%', borderRadius: 99 },
  listTitle: { color: '#475569', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 6 },
  rowMark: { fontSize: 14 },
  rowNum: { color: '#64748b', fontSize: 11, minWidth: 28 },
  rowQ: { flex: 1, color: '#94a3b8', fontSize: 12 },
  rowCorrect: { color: '#fca5a5', fontSize: 11 },
  btnRow: { gap: 10, marginTop: 24 },
  btnWrapper: {},
  btn: { borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  btnOutline: { borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.05)' },
  btnOutlineText: { color: '#94a3b8', fontSize: 14, fontWeight: '700' },
});
