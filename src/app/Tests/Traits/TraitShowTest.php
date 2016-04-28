<?php

use Illuminate\Support\Arr;

trait TraitShowTest
{
    /**
     * リクエスト送信
     * @test
     * @group append
     * @group normal
     * @group show
     * @return void
     */
    public function show002()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $user = $model::find($this->targetId);
        $this->assertInstanceOf($model, $user);
        $this->get('/api/v1/'. $url. '/'. $user->id);
        $this->seeStatusCode(200);
        $expect = $this->getExcludedArray($user->toArray(), static::$unset_columns);
        $this->seeJson($expect);
    }

    /**
     * 権限チェック（一覧×、登録×、編集×、削除×、出力×）
     * @test
     * @group append
     * @group normal
     * @group show
     * @return void
     */
    public function show003()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $this->resetUserRole();
        try {
            $this->get('/api/v1/'. $url. '/'. $this->targetId);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * CSRFヘッダなし
     * @test
     * @group append
     * @group semi_normal
     * @group show
     * @return void
     */
    public function show005()
    {
        list($url, $seeder, $model) = $this->getKlass();

        Config::set('api.allow_ips', []);
        $headers = [];

        try {
            $this->get('/api/v1/'. $url. '/'. $this->targetId, $headers);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * CSRFのヘッダ情報間違い
     * @test
     * @group append
     * @group semi_normal
     * @group show
     * @return void
     */
    public function show006()
    {
        list($url, $seeder, $model) = $this->getKlass();

        Config::set('api.allow_ips', []);
        $headers = ['X-XSRF-TOKEN' => 'invalid'];

        try {
            $this->get('/api/v1/'. $url. '/'. $this->targetId, $headers);
        } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $this->assertEquals(403, $e->getStatusCode());
        }
    }

    /**
     * メンテナンスモード
     * @test
     * @group append
     * @group normal
     * @group show
     * @return void
     */
    public function show007()
    {
        list($url, $seeder, $model) = $this->getKlass();
        $plugin = $this->getPluginName($model);
        $expected = $this->getSortedByKey($seeder::data());
        Config::set('maintenance.'. $plugin. '.access', false);
        Config::set('maintenance.'. $plugin. '.message', 'test');
        $this->get('/api/v1/'. $url. '/'. $this->targetId);
        $this->seeStatusCode(503);
        $this->seeJson();
    }
}
