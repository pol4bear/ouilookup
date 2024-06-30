import { Footer, MyAppBar } from "@/components";

interface Params {
  params: {
    query: string[];
  };
}

export default async function Query({ params }: Params) {
  const query = params.query[0];
  return (
    <>
      <MyAppBar />
      <main  className="flex flex-col items-center justify-center h-center" style={{ minHeight: 'calc(100vh - 100px)'}}>
        <h1>{query}</h1>
      </main>
      <Footer />
    </>
  );
}
