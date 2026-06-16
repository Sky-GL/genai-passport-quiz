import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getCatInfo, CATEGORIES, fetchOne, fetchHint, extractKeyword } from './quiz-data';

const CHOICE_LABELS = ['a', 'b', 'c', 'd'];

export default function QuizScreen() {
  const { catId, batchCount: batchStr } = useLocalSearchParams();
  const batchCount = parseInt(batchStr);
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hint, setHint] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [firstLoading, setFirstLoading] = useState(true);
  const [waitingNext, setWaitingNext] = useState(false);

  const generatingRef = useRef(false);
  const questionsRef = useRef([]);
  const usedCorrectsRef = useRef([]);
  const targetRef = useRef(batchCount);
  const catRef = useRef(catId);

  useEffect(() => { questionsRef.current = questions; }, [questions]);

  const addQuestion = (q) => {
    usedCorrectsRef.current = [...usedCorrectsRef.current, q.correct];
    setQuestions(prev => {
      const updated = [...prev, q];
      questionsRef.current = updated;
      return updated;
    });
  };

  const runGenerator = async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    while (questionsRef.current.length < targetRef.current) {
      const nextNum = questionsRef.current.length + 1;
      // キーワードベースで重複防止
      const usedTexts = questionsRef.current.map(q => extractKeyword(q));
      try {
        const q = await fetchOne(catRef.current, nextNum, usedTexts, usedCorrectsRef.current);
        addQuestion(q);
        setWaitingNext(false);
      } catch (e) {
        console.error('Generation error:', e);
      }
    }
    generatingRef.current = false;
  };

  useEffect(() => {
    const init = async () => {
      try {
        const q1 = await fetchOne(catId, 1, [], []);
        addQuestion(q1);
        setFirstLoading(false);
        runGenerator();
      } catch (e) {
        Alert.alert('エラー', 'APIキーを確認してください。config.jsにAPIキーを入力してください。');
        router.back();
      }
    };
    init();
  }, []);

  const cat = getCatInfo(catId);
  const currentQ = questions[currentIdx];
  const score = Object.entries(answers).filter(([i, c]) => questions[i]?.correct === c).length;
  const isExam = catId === 'exam';
  const qCatColor = isExam
    ? (CATEGORIES.find(c => currentQ?.category?.includes(c.label.slice(0, 4)))?.color || '#f97316')
    : cat?.color;

  const submitAnswer = (choice) => {
    if (showAnswer) return;
    setSelectedChoice(choice);
    setAnswers(a => ({ ...a, [currentIdx]: choice }));
    setShowAnswer(true);
  };

  const requestHint = async () => {
    if (hintLoading || hint || !currentQ) return;
    setHintLoading(true);
    try {
      const result = await fetchHint(currentQ);
      setHint(result.hint);
    } catch { setHint('ヒントの取得に失敗しました。'); }
    setHintLoading(false);
  };

  const goNext = () => {
    const next = currentIdx + 1;
    if (next >= batchCount) {
      router.replace({ pathname: '/result', params: { catId, batchCount: String(batchCount), answers: JSON.stringify(answers), questions: JSON.stringify(questions) } });
      return;
    }
    if (questions.length <= next) {
      setWaitingNext(true);
    }
    setCurrentIdx(next);
    setSelectedChoice(null);
    setShowAnswer(false);
    setHint(null);
  };

  const buffered = questions.length;

  if (firstLoading) {
    return (
      <LinearGradient colors={['#0f172a', '#1a1040', '#0f172a']} style={styles.container}>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color={cat?.color || '#8b5cf6'} />
          <Text style={styles.loadingText}>最初の問題を生成中...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0f172a', '#1a1040', '#0f172a']} style={styles.container}>
      <SafeAreaView style={styles.safe}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← 戻る</Text>
          </TouchableOpacity>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreMain}>{currentIdx + 1}<Text style={styles.scoreSub}> / {batchCount}</Text></Text>
            <Text style={styles.scoreLabel}>正解 {score}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, {
            width: `${((currentIdx + (showAnswer ? 1 : 0)) / batchCount) * 100}%`,
            backgroundColor: qCatColor || '#8b5cf6',
          }]} />
        </View>
        <View style={styles.bufferRow}>
          {buffered < batchCount ? (
            <View style={styles.bufferIndicator}>
              <ActivityIndicator size="small" color="#a78bfa" />
              <Text style={styles.bufferText}>{buffered}/{batchCount}問準備済み</Text>
            </View>
          ) : (
            <Text style={styles.bufferDone}>✅ {batchCount}問すべて準備完了</Text>
          )}
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {waitingNext && !currentQ ? (
            <View style={styles.waitCard}>
              <ActivityIndicator size="large" color={qCatColor || '#8b5cf6'} />
              <Text style={styles.waitText}>次の問題を生成中...</Text>
            </View>
          ) : currentQ ? (
            <View style={styles.card}>
              {/* Question badge */}
              <View style={styles.badgeRow}>
                <LinearGradient colors={[qCatColor || '#8b5cf6', '#6366f1']} style={styles.qBadge}>
                  <Text style={styles.qBadgeText}>問題 {currentIdx + 1}</Text>
                </LinearGradient>
                {currentQ.category && (
                  <View style={[styles.catBadge, { borderColor: `${qCatColor}66`, backgroundColor: `${qCatColor}22` }]}>
                    <Text style={[styles.catBadgeText, { color: qCatColor }]}>{currentQ.category}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.questionText}>{currentQ.questionText}</Text>

              {/* Choices */}
              {CHOICE_LABELS.map(label => {
                const isSelected = selectedChoice === label;
                const isCorrect = currentQ.correct === label;
                const isWrong = showAnswer && isSelected && !isCorrect;
                let bg = 'rgba(255,255,255,0.04)';
                let borderColor = 'rgba(255,255,255,0.1)';
                let textColor = '#cbd5e1';
                if (showAnswer) {
                  if (isCorrect) { bg = 'rgba(34,197,94,0.12)'; borderColor = 'rgba(34,197,94,0.5)'; textColor = '#86efac'; }
                  else if (isWrong) { bg = 'rgba(239,68,68,0.12)'; borderColor = 'rgba(239,68,68,0.5)'; textColor = '#fca5a5'; }
                } else if (isSelected) {
                  bg = `${qCatColor}22`; borderColor = `${qCatColor}80`; textColor = '#c4b5fd';
                }
                return (
                  <TouchableOpacity
                    key={label}
                    onPress={() => !showAnswer && submitAnswer(label)}
                    disabled={showAnswer}
                    style={[styles.choiceBtn, { backgroundColor: bg, borderColor }]}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.choiceLabel, { backgroundColor: `${qCatColor}33` }]}>
                      <Text style={[styles.choiceLabelText, { color: qCatColor }]}>{label}</Text>
                    </View>
                    <Text style={[styles.choiceText, { color: textColor }]}>{currentQ.choices[label]}</Text>
                    {showAnswer && isCorrect && <Text style={styles.mark}>✅</Text>}
                    {showAnswer && isWrong && <Text style={styles.mark}>❌</Text>}
                  </TouchableOpacity>
                );
              })}

              {/* Hint */}
              {!showAnswer && (
                <View style={styles.hintArea}>
                  {hint ? (
                    <View style={styles.hintBox}>
                      <Text style={styles.hintIcon}>💡</Text>
                      <Text style={styles.hintText}>{hint}</Text>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={requestHint} disabled={hintLoading} style={styles.hintBtn}>
                      {hintLoading
                        ? <ActivityIndicator size="small" color="#fbbf24" />
                        : <Text style={styles.hintBtnText}>💡 ヒントを見る</Text>}
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Answer section */}
              {showAnswer && (
                <View style={styles.answerSection}>
                  <View style={[styles.resultBanner, {
                    backgroundColor: currentQ.correct === selectedChoice ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    borderColor: currentQ.correct === selectedChoice ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)',
                  }]}>
                    <Text style={styles.resultEmoji}>{currentQ.correct === selectedChoice ? '🎉' : '😅'}</Text>
                    <Text style={[styles.resultText, { color: currentQ.correct === selectedChoice ? '#86efac' : '#fca5a5' }]}>
                      {currentQ.correct === selectedChoice ? '正解！' : `不正解… 正解は【${currentQ.correct}】`}
                    </Text>
                  </View>

                  <View style={styles.explainBox}>
                    <Text style={[styles.explainTitle, { color: qCatColor || '#a78bfa' }]}>▸ 解説</Text>
                    <Text style={styles.explainText}>{currentQ.explanation}</Text>
                  </View>

                  <View style={styles.wrongBox}>
                    <Text style={styles.wrongTitle}>▸ 不正解の解説</Text>
                    {CHOICE_LABELS.filter(l => l !== currentQ.correct).map(l => (
                      <View key={l} style={styles.wrongRow}>
                        <View style={styles.wrongLabel}>
                          <Text style={styles.wrongLabelText}>{l}</Text>
                        </View>
                        <Text style={styles.wrongText}>{currentQ.wrongExplanations?.[l] || ''}</Text>
                      </View>
                    ))}
                  </View>

                  {currentIdx + 1 < batchCount ? (
                    waitingNext ? (
                      <View style={styles.waitNextBtn}>
                        <ActivityIndicator size="small" color="#a78bfa" />
                        <Text style={styles.waitNextText}>次の問題を生成中...</Text>
                      </View>
                    ) : (
                      <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
                        <LinearGradient colors={[qCatColor || '#8b5cf6', '#6366f1']} style={styles.nextBtn}>
                          <Text style={styles.nextBtnText}>次の問題へ → <Text style={styles.nextBtnSub}>(残り{batchCount - currentIdx - 1}問)</Text></Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )
                  ) : (
                    <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
                      <LinearGradient colors={['#f97316', '#e11d48']} style={styles.nextBtn}>
                        <Text style={styles.nextBtnText}>結果を見る 🏁</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ) : null}

          {/* Progress dots */}
          <View style={styles.dotsRow}>
            {Array.from({ length: batchCount }, (_, i) => {
              const done = answers[i] !== undefined;
              const correct = done && questions[i]?.correct === answers[i];
              const ready = i < questions.length;
              return (
                <View key={i} style={[styles.dot, {
                  backgroundColor: i === currentIdx ? `${qCatColor}44`
                    : done ? (correct ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)')
                    : ready ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)',
                  borderColor: i === currentIdx ? qCatColor
                    : done ? (correct ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)')
                    : ready ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.06)',
                }]}>
                  <Text style={[styles.dotText, {
                    color: i === currentIdx ? qCatColor : done ? (correct ? '#86efac' : '#fca5a5') : '#475569',
                  }]}>{i + 1}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: '#a78bfa', fontSize: 16, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  backBtn: { padding: 8 },
  backText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  scoreBox: { alignItems: 'flex-end' },
  scoreMain: { fontSize: 20, fontWeight: '800', color: '#c4b5fd' },
  scoreSub: { fontSize: 12, color: '#64748b' },
  scoreLabel: { fontSize: 10, color: '#64748b' },
  progressBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 20 },
  progressFill: { height: '100%', borderRadius: 99 },
  bufferRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 2 },
  bufferIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bufferText: { color: '#a78bfa', fontSize: 10 },
  bufferDone: { color: '#86efac', fontSize: 10 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  waitCard: { backgroundColor: 'rgba(26,16,64,0.7)', borderRadius: 16, padding: 48, alignItems: 'center', gap: 16 },
  waitText: { color: '#a78bfa', fontSize: 15, fontWeight: '600' },
  card: { backgroundColor: 'rgba(26,16,64,0.7)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)', padding: 20, marginBottom: 16 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  qBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  qBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  catBadge: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3 },
  catBadgeText: { fontSize: 10, fontWeight: '700' },
  questionText: { fontSize: 15, lineHeight: 24, color: '#f1f5f9', fontWeight: '500', marginBottom: 20 },
  choiceBtn: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  choiceLabel: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, minWidth: 28, alignItems: 'center' },
  choiceLabelText: { fontSize: 12, fontWeight: '700' },
  choiceText: { flex: 1, fontSize: 13, lineHeight: 20 },
  mark: { fontSize: 16 },
  hintArea: { marginTop: 12 },
  hintBox: { backgroundColor: 'rgba(234,179,8,0.08)', borderWidth: 1, borderColor: 'rgba(234,179,8,0.35)', borderRadius: 12, padding: 14, flexDirection: 'row', gap: 8 },
  hintIcon: { fontSize: 16 },
  hintText: { color: '#fde68a', fontSize: 13, lineHeight: 20, flex: 1 },
  hintBtn: { borderWidth: 1, borderColor: 'rgba(234,179,8,0.4)', borderStyle: 'dashed', borderRadius: 12, padding: 12, alignItems: 'center' },
  hintBtnText: { color: '#fbbf24', fontSize: 13, fontWeight: '600' },
  answerSection: { marginTop: 16, gap: 12 },
  resultBanner: { borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultEmoji: { fontSize: 22 },
  resultText: { fontSize: 15, fontWeight: '700' },
  explainBox: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14 },
  explainTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  explainText: { color: '#cbd5e1', fontSize: 13, lineHeight: 20 },
  wrongBox: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 14 },
  wrongTitle: { color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 10 },
  wrongRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  wrongLabel: { backgroundColor: 'rgba(100,116,139,0.15)', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  wrongLabelText: { color: '#64748b', fontSize: 11, fontWeight: '700' },
  wrongText: { color: '#94a3b8', fontSize: 12, lineHeight: 18, flex: 1 },
  nextBtn: { borderRadius: 12, padding: 14, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  nextBtnSub: { fontSize: 11, opacity: 0.7 },
  waitNextBtn: { borderRadius: 12, padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(139,92,246,0.1)', borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)' },
  waitNextText: { color: '#a78bfa', fontSize: 13, fontWeight: '600' },
  dotsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dot: { width: 24, height: 24, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dotText: { fontSize: 9, fontWeight: '700' },
});
