"use client";
import { useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { CommandItem } from "cmdk";

export default function Home() {
  const [input, setinput] = useState<string>("");

  const [searchresult, setsearchresult] = useState<{
    results: string[];
    duration: number;
  }>();
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer);
    }

    // 如果输入为空，清空搜索结果
    if (!input) {
      setsearchresult(undefined);
      return;
    }
    const newTimer = setTimeout(async () => {
      const response = await fetch(`/api/search?q=${input}`);
      const data = (await response.json()) as {
        results: string[];
        duration: number;
      };
      setsearchresult(data);
    }, 400); 

    setTimer(newTimer);

    // 清理函数：组件卸载时清除定时器
    return () => clearTimeout(newTimer);
  }, [input]);

  return (
    <main className='h-screen w-screen bg-slate-200'>
      <div className='flex flex-col gap-5 items-center pt-32 duration-500 animate-in animate fade-in-5 slide-in-from-bottom-3'>
        <div className='flex space-x-2'>
          <h1 className='text-5xl tracking-tight font-bold'>SpeedSearch</h1>
          <img src='/storm.png' width={50} height={50} alt='img'></img>
        </div>

        <p className='text-zinc-600 text-lg max-w-prose text-center'>
          A high performance API built with Hono, Upstash, Next.js and Tailwind
          CSS.
          <br />
          Type a query and get results in milliseconds.
        </p>
        <div className='max-w-md w-full'>
          <Command>
            <CommandInput
              placeholder='Search Countries...'
              value={input}
              onValueChange={setinput}
              className='placeholder:text-zinc-500'
            />
            <CommandList>
              {searchresult?.results.length === 0 ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : null}
              {searchresult?.results ? (
                <CommandGroup heading='Results'>
                  {searchresult?.results.map((result) => (
                    <CommandItem
                      className='text-sm text-zinc-900 px-2 py-1'
                      key={result}
                      value={result}
                      onSelect={setinput}>
                      {result}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}

              {searchresult?.results ? (
                <>
                  <div className='h-px w-full bg-zinc-300'></div>
                  <p className='p-3 text-xs text-zinc-500'>
                    Found {searchresult.results.length} results in{" "}
                    {searchresult?.duration.toFixed(0)}ms
                  </p>
                </>
              ) : null}
            </CommandList>
          </Command>
        </div>
      </div>
    </main>
  );
}
