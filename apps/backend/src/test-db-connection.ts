import dotenv from "dotenv";
import { Pool } from "pg";

// .env 파일 로드
const result = dotenv.config();
if (result.error) {
  console.warn("⚠️  .env 파일 로드 경고:", result.error.message);
}

async function testConnection() {
  // DATABASE_URL 확인
  let databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL 환경변수가 설정되지 않았습니다.");
    console.error("   .env 파일에 DATABASE_URL을 설정해주세요.");
    process.exit(1);
  }

  // 보안을 위해 비밀번호는 마스킹
  const maskedUrl = databaseUrl.replace(/:[^:@]+@/, ":****@");
  console.log("📋 DATABASE_URL:", maskedUrl);

  // URL 파싱하여 연결 정보 확인
  let url: URL;
  try {
    url = new URL(databaseUrl);
    console.log("🔍 연결 정보:");
    console.log(`   호스트: ${url.hostname}`);
    console.log(`   포트: ${url.port || "5432"}`);
    console.log(`   데이터베이스: ${url.pathname.replace("/", "")}`);

    // 직접 연결 URL인 경우 Connection Pooling URL로 변환 시도
    if (
      url.hostname.startsWith("db.") &&
      url.hostname.endsWith(".supabase.co")
    ) {
      const projectRef = url.hostname
        .replace("db.", "")
        .replace(".supabase.co", "");
      console.log(`\n💡 프로젝트 참조: ${projectRef}`);
      console.log(
        "⚠️  직접 연결이 실패하는 경우, Connection Pooling URL을 사용해보세요:",
      );
      console.log(
        `   postgresql://postgres.${projectRef}:비밀번호@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`,
      );
      console.log(
        '   또는 Supabase 대시보드의 Connection string에서 "Session mode" 또는 "Transaction mode" 확인\n',
      );
    }
  } catch (error) {
    console.warn("⚠️  URL 파싱 실패");
  }

  console.log("🔌 데이터베이스 연결 시도 중...\n");

  // 연결 옵션 설정
  const poolConfig: any = {
    connectionString: databaseUrl,
    connectionTimeoutMillis: 15000,
    // SSL 연결 강제 (Supabase는 SSL 필수)
    ssl: {
      rejectUnauthorized: false, // Supabase의 자체 서명 인증서 허용
    },
    // IPv4만 사용 (IPv6 문제 회피)
    family: 4,
  };

  const pool = new Pool(poolConfig);

  try {
    const client = await pool.connect();

    // 간단한 쿼리로 연결 테스트
    const result = await client.query(
      "SELECT NOW() as current_time, version() as version",
    );

    console.log("✅ 데이터베이스 연결 성공!");
    console.log("📅 현재 시간:", result.rows[0].current_time);
    console.log("🗄️  PostgreSQL 버전:", result.rows[0].version.split(",")[0]);

    // 테이블 존재 확인
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("\n📊 존재하는 테이블:");
    if (tablesResult.rows.length === 0) {
      console.log(
        "  ⚠️  테이블이 없습니다. Supabase에서 테이블을 생성해주세요.",
      );
    } else {
      tablesResult.rows.forEach((row) => {
        console.log(`  - ${row.table_name}`);
      });
    }

    // users 테이블이 있으면 샘플 데이터 확인
    if (tablesResult.rows.some((row) => row.table_name === "users")) {
      const usersCount = await client.query(
        "SELECT COUNT(*) as count FROM users",
      );
      console.log(`\n👥 users 테이블 레코드 수: ${usersCount.rows[0].count}`);
    }

    // posts 테이블이 있으면 샘플 데이터 확인
    if (tablesResult.rows.some((row) => row.table_name === "posts")) {
      const postsCount = await client.query(
        "SELECT COUNT(*) as count FROM posts",
      );
      console.log(`📝 posts 테이블 레코드 수: ${postsCount.rows[0].count}`);
    }

    // comments 테이블이 있으면 샘플 데이터 확인
    if (tablesResult.rows.some((row) => row.table_name === "comments")) {
      const commentsCount = await client.query(
        "SELECT COUNT(*) as count FROM comments",
      );
      console.log(
        `💬 comments 테이블 레코드 수: ${commentsCount.rows[0].count}`,
      );
    }

    client.release();
    await pool.end();

    console.log("\n✅ 연결 테스트 완료!");
    process.exit(0);
  } catch (error) {
    console.error("❌ 데이터베이스 연결 실패:");
    if (error instanceof Error) {
      console.error("에러 메시지:", error.message);
      console.error("에러 스택:", error.stack);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

testConnection();
